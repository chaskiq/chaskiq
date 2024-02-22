# frozen_string_literal: true

class Agents::SessionsController < Devise::SessionsController
  include Trackeable

  skip_before_action :verify_authenticity_token, only: [:destroy]
  skip_before_action :verify_signed_out_user, only: [:destroy]

  skip_before_action :require_no_authentication, only: [:create]
  before_action :clear_session, only: [:create]

  layout "devise"

  # def new
  # redirect_to new_agent_session_path and return
  # end

  def create
    # require_no_authentication

    respond_to do |format|
      format.html do
        resource = warden.authenticate!(scope: resource_name)
        sign_in(resource_name, resource)

        # return
        # redirect_to root_path and return
      end
      format.json do
        self.resource = warden.authenticate!(auth_options)

        # need this session for /oauth/applications & authorization
        # for credential (aprove)
        # TODO: figure out how can avoid this
        # like customize /oauth/applications
        # sign_in(resource_name, resource, {store: true})

        track_event(resource, "login")

        if session[:return_to].blank?
          a = Doorkeeper::Application.first

          access_token = Doorkeeper::AccessToken.find_or_create_for(
            a, resource, "", 1.hour, true
          )

          respond_with_navigational(resource, status: :success) do
            render json: {
              access_token: access_token.token,
              refresh_token: access_token.refresh_token,
              expires_in: access_token.expires_in
            }
          end
        else
          redirect_to session[:return_to]
          session[:return_to] = nil
        end
      end
    end
  end

  # DELETE /resource/sign_out
  def destroy
    track_event(current_agent, "logout")

    if request.headers["access-token"]
      token = current_agent.access_tokens.find_by(token: request.headers["access-token"])
      token.destroy if token.present?
    end

    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message! :notice, :signed_out if signed_out
    yield if block_given?
    # respond_to_on_destroy

    respond_to do |format|
      format.html { super }
      format.json do
        respond_with_navigational(resource, status: :success) do
          render json: { a: "ok" }
        end
      end
    end
  end

  private

  def clear_session
    request.env["warden"].logout
  end
end
