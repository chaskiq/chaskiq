class Apps::QuickRepliesController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index; end

  def show
    @quick_reply = @app.quick_replies.find(params[:id])
  end

  def new
    @quick_reply = @app.quick_replies.new
  end

  def edit
    @quick_reply = @app.quick_replies.find(params[:id])
  end

  def update
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
  end

  def destroy
    @quick_reply = @app.quick_replies.find(params[:id])
    if @quick_reply.destroy
      flash[:success] = "Object was successfully deleted."
    else
      flash[:error] = "Something went wrong"
    end
    redirect_to app_quick_replies_url(@app.key)
  end

  private

  def resource_params
    params.require(:quick_reply).permit(:title, :content)
  end
end
