class Apps::OauthApplicationsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index
    @oauth_applications = if params[:authorized]
                            @app.oauth_applications.authorized_for(current_agent)
                          else
                            @app.oauth_applications
                          end
    @oauth_applications = @oauth_applications.page(params[:page]).per(params[:per])
  end

  def new
    @oauth_application = @app.oauth_applications.new
  end

  def edit
    @oauth_application = @app.oauth_applications.find(params[:id])
  end

  def create
    resource_params = params.require(:doorkeeper_application).permit(:name, :redirect_uri, :scopes, :confidential)
    @oauth_application = @app.oauth_applications.new(resource_params)
    if @oauth_application.save
      flash.now[:notice] = "Place was updated!"
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
    resource_params = params.require(:doorkeeper_application).permit(:name, :redirect_uri, :scopes, :confidential)
    @oauth_application = @app.oauth_applications.find(params[:id])
    if @oauth_application.update(resource_params)
      flash.now[:notice] = "Place was updated!"
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
    @oauth_application = @app.oauth_applications.find(params[:id])
  end
end
