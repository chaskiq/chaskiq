class Apps::OauthApplicationsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator
  before_action :check_plan

  def index
    authorize! @app, to: :can_read_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    @oauth_applications = if params[:authorized]
                            @app.oauth_applications.authorized_for(current_agent)
                          else
                            @app.oauth_applications
                          end
    @oauth_applications = @oauth_applications.page(params[:page]).per(params[:per])
  end

  def new
    authorize! @app, to: :can_write_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    @oauth_application = @app.oauth_applications.new
  end

  def edit
    authorize! @app, to: :can_write_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    @oauth_application = @app.oauth_applications.find(params[:id])
  end

  def create
    authorize! @app, to: :can_write_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    resource_params = params.require(:doorkeeper_application).permit(:name, :redirect_uri, :scopes, :confidential)
    @oauth_application = @app.oauth_applications.new(resource_params)
    if @oauth_application.save
      flash.now[:notice] = t("status_messages.updated_success")
      # render turbo_stream: [
      #	flash_stream,
      # turbo_stream.replace(
      #	"app-settings",
      #	template: "apps/oauth_applications/index"
      # )
      # ]
      redirect_to app_oauth_applications_path(@app.key)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def update
    authorize! @app, to: :can_write_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    resource_params = params.require(:doorkeeper_application).permit(:name, :redirect_uri, :scopes, :confidential)
    @oauth_application = @app.oauth_applications.find(params[:id])
    if @oauth_application.update(resource_params)
      flash.now[:notice] = t("status_messages.updated_success")
      render turbo_stream: [
        flash_stream,
        turbo_stream.replace(
          "app-settings",
          template: "apps/oauth_applications/show"
        )
      ]
    else
      render "new", status: :unprocessable_entity
    end
  end

  def show
    authorize! @app, to: :can_read_oauth_applications?, with: AppPolicy, context: {
      user: current_agent
    }

    @oauth_application = @app.oauth_applications.find(params[:id])
  end

  private

  def check_plan
    allowed_feature?("OauthApplications")
  end
end
