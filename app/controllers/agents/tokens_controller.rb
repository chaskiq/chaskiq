# frozen_string_literal: true

class Agents::TokensController < Doorkeeper::TokensController
  def create
    headers.merge!(authorize_response.headers)

    if authorize_response.status == :ok
      agent = authorize_response.body[:result]
      track_event(agent, "login")
    end

    render json: authorize_response.body,
           status: authorize_response.status
  rescue Doorkeeper::Errors::DoorkeeperError => e
    handle_token_exception(e)
  end

  private

  def track_event(resource, action)
    resource.log_async(action:, user: resource, ip: request.remote_ip)
  end
end
