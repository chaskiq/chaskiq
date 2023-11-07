class Apps::WebhooksController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator
  before_action :check_plan, only: [:create]

  def index
    authorize! @app, to: :can_read_outgoing_webhooks?, with: AppPolicy, context: {
      user: current_agent
    }

    @webhooks = @app.outgoing_webhooks.enabled if !params[:kind] || params[:kind] != "disabled"
    @webhooks = @app.outgoing_webhooks.disabled if params[:kind] == "disabled"
    @webhooks = @webhooks.page(params[:page]).per(params[:per])
  end

  def new
    authorize! @app, to: :can_write_outgoing_webhooks?, with: AppPolicy, context: {
      user: current_agent
    }
    @webhook = @app.outgoing_webhooks.new
  end

  def edit
    authorize! @app, to: :can_write_outgoing_webhooks?, with: AppPolicy, context: {
      user: current_agent
    }
    @webhook = @app.outgoing_webhooks.find(params[:id])
  end

  def create
    authorize! @app, to: :can_write_outgoing_webhooks?, with: AppPolicy, context: {
      user: current_agent
    }
    resource_params = params.require(:outgoing_webhook).permit(:state, :url, tag_list: [])
    @webhook = @app.outgoing_webhooks.new(resource_params)
    if @webhook.save
      flash.now[:notice] = I18n.t("settings.webhooks.create_success")
      # render turbo_stream: [
      #	flash_stream,
      # turbo_stream.replace(
      #	"app-settings",
      #	template: "apps/webhooks/index"
      # )
      # ]
      redirect_to app_webhooks_path(@app.key)
    else
      # I18n.t('settings.webhooks.create_error')
      render "create"
    end
  end

  def update
    resource_params = params.require(:outgoing_webhook).permit(:state, :url, tag_list: [])
    @webhook = @app.outgoing_webhooks.find(params[:id])
    if @webhook.update(resource_params)
      flash.now[:notice] = I18n.t("settings.webhooks.update_success")

      redirect_to app_webhooks_path(
        @app.key,
        kind: @webhook.is_enabled ? "enabled" : "disabled"
      )
      # render turbo_stream: [
      #	flash_stream,
      #	turbo_stream.replace(
      #		"app-settings",
      #		template: "apps/webhooks/show"
      #	)
      # ]
    else
      # I18n.t('settings.webhooks.update_error')
      render "new", status: :unprocessable_entity
    end
  end

  def destroy
    @webhook = @app.outgoing_webhooks.find(params[:id])
    kind = @webhook.is_enabled ? "enabled" : "disabled"

    flash.now[:notice] = I18n.t("settings.webhooks.delete_success") if @webhook.destroy

    redirect_to app_webhooks_path(
      @app.key,
      kind: kind
    )
  end

  private

  def check_plan
    allowed_feature?("OutgoingWebhooks")
  end
end
