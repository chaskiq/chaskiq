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

  # server side

  def callback
    # OmniAuth stores the information returned from Auth0 and the IdP in request.env['omniauth.auth'].
    # In this code, you will pull the raw_info supplied from the id_token and assign it to the session.
    # Refer to https://github.com/auth0/omniauth-auth0/blob/master/EXAMPLES.md#example-of-the-resulting-authentication-hash for complete information on 'omniauth.auth' contents.
    auth_info = request.env["omniauth.auth"]
    session[:userinfo] = auth_info["extra"]["raw_info"]

    # Redirect to the URL you want after successful auth
    redirect_to "/dashboard"
  end

  def failure
    # Handles failed authentication -- Show a failure page (you can also handle with a redirect)
    @error_msg = request.params["message"]
  end

  # ..Insert the code below
  def logout
    reset_session
    redirect_to logout_url, allow_other_host: true
  end

  private

  def logout_url
    request_params = {
      returnTo: root_url,
      client_id: AUTH0_CONFIG["auth0_client_id"]
    }

    URI::HTTPS.build(host: AUTH0_CONFIG["auth0_domain"], path: "/v2/logout", query: request_params.to_query).to_s
  end
end
