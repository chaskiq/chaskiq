class Apps::QuickRepliesController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator
  before_action :check_plan

  def index; end

  def show
    authorize! @app, to: :can_read_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.find(params[:id])
  end

  def new
    authorize! @app, to: :can_write_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.new
  end

  def edit
    authorize! @app, to: :can_wirte_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.find(params[:id])
  end

  def update
    authorize! @app, to: :can_write_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.find(params[:id])

    I18n.with_locale(params[:locale] || I18n.locale) do
      @quick_reply.update(resource_params)
    end

    if @quick_reply.errors.blank?
      respond_to do |format|
        if @quick_reply.save
          flash[:success] = "Object was successfully updated"
          format.html { redirect_to(app_quick_reply_url(@app.key), locale: params[:locale]) }
          format.turbo_stream do
            render turbo_stream: [
              turbo_stream.replace(
                "quick_reply_editor",
                partial: "apps/quick_replies/quick_reply"
              ),
              turbo_stream.replace(
                "quick-reply-#{@quick_reply.id}",
                partial: "apps/quick_replies/list_item",
                locals: { quick_reply: @quick_reply }
              )
            ]
          end
        else
          format.html { render action: "new" }
        end
      end
    else
      flash[:error] = "Something went wrong"
      render "edit"
    end
  end

  def create
    authorize! @app, to: :can_write_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.new(resource_params)
    respond_to do |format|
      if @quick_reply.save
        flash[:notice] = "quick_reply was successfully created."
        format.html { redirect_to(app_quick_reply_url(@app.key, @quick_reply)) }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace(
              "quick_reply_editor",
              partial: "apps/quick_replies/quick_reply"
            ),
            turbo_stream.append(
              "quick-replies-list",
              partial: "apps/quick_replies/list_item",
              locals: { quick_reply: @quick_reply }
            )
          ]
        end
      else
        format.html { render action: "new" }
      end
    end
  end

  def destroy
    authorize! @app, to: :can_write_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_reply = @app.quick_replies.find(params[:id])
    if @quick_reply.destroy
      flash[:success] = "Object was successfully deleted."
    else
      flash[:error] = "Something went wrong"
    end
    redirect_to app_quick_replies_url(@app.key)
  end

  private

  def check_plan
    allowed_feature?("QuickReplies")
  end

  def resource_params
    params.require(:quick_reply).permit(:title, :content, :locale)
  end
end
