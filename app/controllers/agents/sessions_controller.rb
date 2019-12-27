# frozen_string_literal: true

class Agents::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:destroy]
  skip_before_action :verify_signed_out_user, only: [:destroy]

  skip_before_action :require_no_authentication, only: [:create]
  before_action :clear_session, only: [:create]

  def create

    require_no_authentication

    self.resource = warden.authenticate!(auth_options)

    # need this session for /oauth/applications & authorization 
    # for credential (aprove)
    # TODO: figure out how can avoid this 
    # like customize /oauth/applications
    sign_in(resource_name, resource, {store: true})

    if !session[:return_to].blank?
      redirect_to session[:return_to]
      session[:return_to] = nil
    else
      
      a = Doorkeeper::Application.first
      client = OAuth2::Client.new(a.uid, a.secret, site: a.redirect_uri)

      access_token =  client.password.get_token(
        params[:agent][:email], 
        params[:agent][:password]
      )
      
      respond_with_navigational(resource, status: :success) do
        render json: access_token
      end
    end
  end


  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message! :notice, :signed_out if signed_out
    yield if block_given?
    # respond_to_on_destroy
    respond_with_navigational(resource, status: :success) do
      render json: { a: 'ok' }
    end
  end

  private

  def clear_session
    request.env['warden'].logout
  end
end
