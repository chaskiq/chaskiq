class Agents::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def doorkeeper
    @user = Agent.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?
      @user.update_doorkeeper_credentials(request.env["omniauth.auth"])
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "Doorkeeper") if is_navigational_format?
    else
      session["devise.doorkeeper_data"] = request.env["omniauth.auth"]
      redirect_to new_agent_registration_url
    end
  end

  def auth0
    callback_handler
  end

  def failure
    redirect_to root_path
  end

  def callback_handler
    auth = request.env["omniauth.auth"]
    # logger.info(request.env['omniauth.auth'].to_json)
    provider = auth["provider"]

    current_agent = Agent.find_by(email: auth["info"]["email"])
    # logger.info("#{provider}, #{auth['uid']}, #{current_user.to_json}")

    user = Agent.find_by_identity_for(provider, auth, current_agent)
    if user.present?
      flash.now[:notice] = "We are synchronizing your #{provider} data, it may take a while"
      redirect_to apps_path(user.username, :integrations) if agent_signed_in?
      unless agent_signed_in?
        sign_in(:agent, user)
        redirect_to root_url and return
      end

    else
      session["devise.omniauth_data"] = auth.except("extra")
      redirect_to(new_agent_registration_url)
    end
  end
end
