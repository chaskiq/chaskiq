class Api::V1::Hooks::ProviderController < ApplicationController
  before_action :find_application_package, except: [:global_process_event]

  def create
    response = @integration_pkg.create_hook_from_params(params)
    api = @integration_pkg.message_api_klass

    if api&.response_with_text?
      render(status: :ok, plain: response)
    else
      render(status: :ok, xml: response.to_xml)
    end
  end

  def global_process_event
    response = AppPackage.find_by(
      name: params["provider"].capitalize
    ).process_global_hook(params)

    response_handler(response)
    # render plain: response
  end

  def process_event
    response = @integration_pkg.process_event(params)
    response_handler(response)
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

  def resolve_status(response)
    return 422 if response[:status] == :error

    200
  end

  def auth; end

  def response_handler(response)
    case response.class.to_s
    when "String"
      render plain: response
    when "Hash"
      render(json: response, status: resolve_status(response))
    when "Array"
      render(json: response)
    else
      head :ok
    end
  end
end
