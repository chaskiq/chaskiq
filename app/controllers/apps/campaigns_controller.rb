class Apps::CampaignsController < ApplicationController
  before_action :find_app

  def index
    namespace = params[:namespace] || "campaigns"
    @collection = @app.send(namespace) if Message.allowed_types.include?(namespace)
    @collection = @collection.page(params[:page]).per(20)
  end

  def show
    @campaign = @app.messages.find(params[:id])
    @collection = @campaign.metrics.page(params[:page]).per(10)
    @tab = "stats"
  end

  def edit
    @campaign = @app.messages.find(params[:id])
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
    if params[:tab] = "audience"
      segment_predicate = resource_params[:segments][:segment_predicate]
      segment_predicates = segment_predicate.keys.sort.map { |key| segment_predicate[key] }
      
      unless params[:new_segment].present?
        if params[:force_save] == "true"
          @campaign.update(segments: segment_predicates)
        else
          @campaign.assign_attributes(segments: segment_predicates)
        end
      end
      
      audience_handler
      @tab =  params[:tab]
      
    else
      @tab = "editor"
      @campaign.update(resource_params)
    end
  end

  private

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
      @namespace = "banner"
      return params.require(:banner).permit(
        :dismiss_button, :serialized_content, :show_sender, :sender_id, :url, 
        :action_text, :font_options, :bg_color, :placement,
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
      @namespace = "userautomessage"
      return params.require(:user_auto_message).permit(:serialized_content, 
        segments: {
          segment_predicate: [
            :type,
            :attribute,
            :comparison,
            { value: [] }, # This permits the value as an array
            :value # This permits the value as a scalar (e.g., string)
          ]
        })
    end

    if params.keys.include?("campaign")
      @namespace = "campaign"
      params.require(:campaign).permit(
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
