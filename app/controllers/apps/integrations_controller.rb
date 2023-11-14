class Apps::IntegrationsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator
  before_action :check_plan

  def index
    authorize! @app, to: :can_read_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }

    case params[:kind]
    when "available"
      # authorize! object, to: :manage?, with: AppPolicy, context: {
      # user: current_agent
      # }
      integrations = @app.app_package_integrations.map(&:app_package_id)
      @app_packages = if integrations.any?
                        AppPackage.where.not("id in(?)", integrations)
                      else
                        AppPackage.all
                      end
    when "yours"
      @agent_app_packages = current_agent.app_packages
    else
      @integrations = @app.app_package_integrations
      # @integrations = @integrations
    end
  end

  def edit
    authorize! @app, to: :can_write_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }

    @integration = @app.app_package_integrations.find(params[:id])
  end

  def new
    authorize! @app, to: :can_write_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }
    @app_package = AppPackage.find(params[:app_package])
    @integration = @app.app_package_integrations.new(app_package: @app_package)
  end

  def update
    authorize! @app, to: :can_write_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }
    @integration = @app.app_package_integrations.find(params[:id])
    resource_params = params[:app_package_integration].permit!
    external_id = params[:app_package_integration][:external_id]
    flash.now[:notice] = t("status_messages.updated_success") if @integration.update(
      settings: @integration.settings.merge!(resource_params),
      external_id: external_id
    )
  end

  def create
    authorize! @app, to: :can_write_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }
    resource_params = params[:app_package_integration].permit!
    @app_package = AppPackage.find(params[:app_package])
    @integration = @app.app_package_integrations.new(app_package: @app_package)

    flash.now[:notice] = t("status_messages.updated_success") if @integration.update(settings: resource_params)
  end

  def destroy
    authorize! @app, to: :can_write_app_packages?, with: AppPolicy, context: {
      user: current_agent
    }
    @integration = @app.app_package_integrations.find(params[:id])
    if @integration.destroy
      flash.now[:notice] = t("status_messages.deleted_success")
      redirect_to app_integrations_path(@app.key)
    end
  end

  private

  def check_plan
    allowed_feature?("Integrations")
  end
end
