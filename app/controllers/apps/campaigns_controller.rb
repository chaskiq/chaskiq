class Apps::CampaignsController < ApplicationController
  before_action :find_app
  # before_action :check_plan

  def index
    authorize! @app, to: :can_read_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @namespace = params[:namespace] || "campaigns"
    @collection = @app.send(@namespace) if Message.allowed_types.include?(@namespace)
    @collection = @collection.page(params[:page]).per(20)
  end

  def new
    authorize! @app, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @namespace = params[:namespace] || "campaigns"
    @campaign = @app.send(@namespace).new if Message.allowed_types.include?(@namespace)
  end

  def create
    authorize! @app, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @namespace = params[:namespace] || "campaigns"
    @campaign = @app.send(@namespace).new if Message.allowed_types.include?(@namespace)
    @campaign.assign_attributes(resource_params)
    if @campaign.save
      redirect_to app_campaign_path(@app.key, @campaign)
    else
      render "new"
    end
  end

  def show
    @campaign = @app.messages.find(params[:id])

    authorize! @campaign, to: :can_read_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @collection = @campaign.metrics.page(params[:page]).per(10)
    @tab = "stats"
  end

  def edit
    @campaign = @app.messages.find(params[:id])

    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    case params[:tab]
    when nil, "stats"
      @tab = "stats"
      @collection = @campaign.metrics.page(params[:page]).per(10)
    when "audience"
      # handle_audience #and return
      audience_handler
      @tab = "audience"
    when "settings"
      @tab = "settings"
    when "editor"
      @tab = "editor"
      @editor = "apps/campaigns/editors/#{@campaign.type.downcase}"
    end

    render "show"
  end

  def update
    @campaign = @app.messages.find(params[:id])

    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    if params[:toggle]
      @campaign.update(state: @campaign.state == "disabled" ? "enabled" : "disabled")
      flash.now[:notice] = "Campaign was updated!"
      render turbo_stream: [flash_stream] and return
    end

    case params[:tab]
    when "audience"
      segment_predicate = resource_params[:segments][:segment_predicate]
      segment_predicates = segment_predicate.keys.sort.map { |key| segment_predicate[key] }

      if params[:new_segment].blank?
        if params[:force_save] == "true"
          @campaign.update(segments: segment_predicates)
        else
          @campaign.assign_attributes(segments: segment_predicates)
        end
      end

      audience_handler
      @tab = params[:tab]
    when "settings"
      @campaign.update(resource_params)
    else
      @tab = "editor"
      @namespace = params[:namespace]
      if params[:draft].present?
        @campaign.assign_attributes(resource_params)
      else
        @campaign.update(resource_params)
      end
    end
  end

  def clone
    # authorize! message, to: :can_manage_campaigns?, with: AppPolicy, context: {
    #  app: app
    # }

    @campaign = @app.messages.find(params[:id])

    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    new_message = @campaign.dup
    new_message.name = "#{new_message.name} (copy)"
    new_message.state = "disabled"
    new_message.save

    redirect_to app_campaign_path(@app.key, new_message)
  end

  def deliver
    @campaign.send_newsletter
    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    flash.now[:notice] = "Place was updated!"
    render "show"
  end

  def purge_metrics
    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    # set_campaign(id)
    @campaign.metrics.destroy_all
    flash.now[:notice] = "Place was updated!"
    render "show"
  end

  def destroy
    @campaign = @app.messages.find(params[:id])

    authorize! @campaign, to: :can_manage_campaigns?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    redirect_to app_campaigns_path(@app.key)
  end

  def tour_editor
    @campaign = @app.messages.find(params[:id])
    render "apps/campaigns/tours/tour_editor", layout: "messenger"
  end

  def tour_step
    @campaign = @app.messages.find(params[:id])

    default = { "target" => params[:target] }
    step = begin
      (params[:position].present? ? @campaign.settings["steps"][params[:position].to_i] : default)
    rescue StandardError
      default
    end

    @step = TourStepForm.new(
      title: step["title"],
      content: step["content"],
      target: step["target"],
      position: params[:position]
    )

    if request.post?
      @step = TourStepForm.new(
        title: params[:tour_step_form][:title],
        content: params[:tour_step_form][:content],
        target: params[:tour_step_form][:target]
      )

      # Fetch the current steps
      current_steps = @campaign.steps || []

      index = params[:position].present? ? params[:position].to_i : current_steps.size

      step_data = @step

      Rails.logger.debug { "NEXT INDEX IS! #{index}" }

      # Update the specific step at the desired index
      current_steps[index] = step_data

      # Update the tour with the modified steps
      if @campaign.update(steps: current_steps)
        @step.position = index
        @campaign.broadcast_step(@step)
        render "apps/campaigns/tours/tour_step", layout: false and return
      end
    end

    if request.delete?
      current_steps = @campaign.settings["steps"]
      current_steps.delete_at(params[:position].to_i)
      @campaign.update(steps: current_steps)
      render "apps/campaigns/tours/tour_editor", layout: false and return
    end

    render "apps/campaigns/tours/step_editor", layout: "messenger"
  end

  private

  def check_plan
    allowed_feature?("Campaigns")
  end

  def audience_handler
    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @campaign.segments
    )

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    @collection = @segment_manager.results({
                                             page: params[:page],
                                             per: 5
                                           })
  end

  def handle_audience
    turbo_views = [
      turbo_stream.replace(
        "segment_form",
        partial: "apps/segment_manager/form",
        locals: {
          app: @app,
          segment_manager: @segment_manager,
          changed: false,
          incomplete: false
        }
      )
    ]

    unless @segment_manager.predicates.find { |o| o.value.nil? }
      turbo_views << turbo_stream.replace(
        "segment-table",
        partial: "apps/segment_manager/table",
        locals: {
          app: @app,
          segment_manager: @segment_manager,
          results: @segment_manager.results(params)
        }
      )
    end

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_views
      end
      format.html # { redirect_to "/" }
    end
  end

  def resource_params
    if params.keys.include?("banner")
      return params.require(:banner).permit(
        :name, :description, :scheduled_at,
        :scheduled_to,
        :mode,
        :hidden_constraints,
        :dismiss_button, :serialized_content, :show_sender, :sender_id, :url,
        :action_text, :font_options, :bg_color, :placement,
        hidden_constraints: [],
        segments: {
          segment_predicate: [
            :type,
            :attribute,
            :comparison,
            { value: [] }, # This permits the value as an array
            :value # This permits the value as a scalar (e.g., string)
          ]
        }
        # segments: [segment_predicate: [:value, :type, :attribute, :comparison] ]
      )
    end

    if params.keys.include?("user_auto_message")
      return params.require(:user_auto_message).permit(
        :serialized_content,
        :name,
        :subject,
        :description,
        :scheduled_at,
        :scheduled_to,
        :hidden_constraints,
        hidden_constraints: [],
        segments: {
          segment_predicate: [
            :type,
            :attribute,
            :comparison,
            { value: [] }, # This permits the value as an array
            :value # This permits the value as a scalar (e.g., string)
          ]
        }
      )
    end

    if params.keys.include?("campaign")
      return params.require(:campaign).permit(
        :hidden_constraints,
        :serialized_content, :timezone, :name, :from_name, :subject, :description, :scheduled_to, :scheduled_at,
        segments: {
          segment_predicate: [
            :type,
            :attribute,
            :comparison,
            { value: [] }, # This permits the value as an array
            :value # This permits the value as a scalar (e.g., string)
          ]
        }
      )
    end

    if params.keys.include?("tour")
      params.require(:tour).permit(
        :url, :hidden_constraints,
        :serialized_content, :timezone, :name, :from_name, :subject, :description, :scheduled_to, :scheduled_at,
        segments: {
          segment_predicate: [
            :type,
            :attribute,
            :comparison,
            { value: [] }, # This permits the value as an array
            :value # This permits the value as a scalar (e.g., string)
          ]
        }
      )
    end
  end
end
