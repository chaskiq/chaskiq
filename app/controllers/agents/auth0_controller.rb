require "auth0_web_token"

class Agents::Auth0Controller < ApplicationController
  include Trackeable

  def create
    json = Auth0WebToken.verify(params[:access_token])
    # id_token =  JWT.decode(params[:id_token], nil, false)

    # TODO: check the json.sub === id_token.sub
    response = get_user_info(params[:access_token])

    agent = Agent.find_by(email: response["email"])

    if agent.blank?
      pass_placeholder = SecureRandom.base64(10)
      agent = Agent.new(email: response["email"], password: pass_placeholder, password_confirmation: pass_placeholder)
      agent.save
    end

    agent.auth_identities.find_or_create_by(provider: "auth0", uid: response["sub"])

    track_event(agent, "login")

    render json: {
      access_token: params[:access_token],
      refresh_token: params[:refresh_token]
    }
  end

  def get_user_info(token)
    conn = Faraday.new(
      url: "https://#{Chaskiq::Config.get('AUTH0_DOMAIN')}",
      headers: { "Content-Type" => "application/json" }
    )
    conn.request :authorization, :Bearer, token
    response = conn.get("/userinfo")
    JSON.parse(response.body) if response.success?
  end
end
