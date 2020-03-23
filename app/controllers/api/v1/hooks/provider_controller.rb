
class Api::V1::Hooks::ProviderController < ApplicationController

  before_action :find_application_package

  def create
    response = @integration_pkg.create_hook_from_params(params)
    api = @integration_pkg.message_api_klass
    api.respond_to?(:response_with_text?) && api.response_with_text? ?
    render( status: 200, plain: response) :
    render( status: 200, json: response.to_json)
  end

  def process_event
    response = @integration_pkg.process_event(params)
    render status: 200, json: response
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


  def oauth
    response = @integration_pkg.receive_oauth_code(params)
    render status: 200, json: response.to_json 
  end

  def auth
  end
  
end
