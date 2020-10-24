class Api::V1::Hooks::ProviderController < ApplicationController
  before_action :find_application_package, except: [:global_process_event]

  def create
    response = @integration_pkg.create_hook_from_params(params)
    api = @integration_pkg.message_api_klass
    if api.respond_to?(:response_with_text?) && api.response_with_text?
      render(status: 200, plain: response)
    else
      render(status: 200, json: response.to_json)
    end
  end

  def global_process_event
    response = AppPackage.find_by(
      name: params['provider'].capitalize
    ).process_global_hook(params)

    render plain: response
  end

  def process_event
    response = @integration_pkg.process_event(params)
    render status: 200, json: response
  end

  def find_application_package
    @integration_pkg = AppPackageIntegration.decode(params[:id])
    app = @integration_pkg.app
  end

  def oauth
    response = @integration_pkg.receive_oauth_code(params)
    pkg = AppPackageIntegration.decode(params[:id])
    redirect_to "/apps/#{pkg.app.key}/integrations"
  end

  def auth; end
end
