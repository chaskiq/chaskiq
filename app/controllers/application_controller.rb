# frozen_string_literal: true

class ApplicationController < ActionController::Base
  respond_to :json
  protect_from_forgery unless: -> { request.format.json? }
  # protect_from_forgery with: :null_session

  layout :layout_by_resource

  def preview
    @app = App.find_by(key: params[:app])
    @campaign = @app.campaigns.find(params[:id])
    # render plain: "hello"
    render 'campaigns/iframe', layout: false
  end

  def current_resource_owner
    Agent.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end
  
  def current_user
    current_resource_owner || warden.authenticate(:agent) rescue nil
  end

  def package_iframe
    render "app_packages/#{params[:package]}/show", layout: false
  end

  def render_empty
    render html: '', layout: 'application'
  end

  def user_session
    render json: { current_user: {
      email: current_user.email
    } }
  end

  def catch_all
    render_empty
  end

  private

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = '1728000'
  end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render text: '', content_type: 'text/plain'
    end
  end

  def layout_by_resource
    if devise_controller?
      'devise'
    else
      'application'
    end
  end
end
