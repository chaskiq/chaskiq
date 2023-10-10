class Apps::IntegrationsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index
    case params[:kind]
    when "available"
      # authorize! object, to: :manage?, with: AppPolicy
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
    @integration = @app.app_package_integrations.find(params[:id])
  end

  def new
    @app_package = AppPackage.find(params[:app_package])
    @integration = @app.app_package_integrations.new(app_package: @app_package)
  end

  def update
    @integration = @app.app_package_integrations.find(params[:id])
    resource_params = params[:app_package_integration].permit!
    external_id = params[:app_package_integration][:external_id]
    flash.now[:notice] = "Place was updated!" if @integration.update(
      settings: @integration.settings.merge!(resource_params),
      external_id: external_id
    )
  end

  def create
    resource_params = params[:app_package_integration].permit!
    @app_package = AppPackage.find(params[:app_package])
    @integration = @app.app_package_integrations.new(app_package: @app_package)

    flash.now[:notice] = "Place was updated!" if @integration.update(settings: resource_params)
  end

  def destroy
    @integration = @app.app_package_integrations.find(params[:id])
    if @integration.destroy
      flash.now[:notice] = "Place was updated!"
      redirect_to app_integrations_path(@app.key)
    end
  end
end
