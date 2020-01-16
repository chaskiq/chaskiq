class Api::V1::Hooks::ProviderController < ApplicationController

  before_action :find_application_package

  def create
    response = @integration_pkg.create_hook_from_params(params)
    render status: 200 , json: response.to_json
  end

  def process_event
    @integration_pkg.process_event(params)
    render status: 200, json: {}
  end

  def find_application_package
    app = App.find_by(key: params[:app_key])

    @integration_pkg = app.app_package_integrations
                          .joins(:app_package)
                          .where(
                              id: params[:id], 
                              "app_packages.name": params[:provider].capitalize
                          ).first
  end
  
end
