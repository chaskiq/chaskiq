class ApplicationController < ActionController::Base

  protect_from_forgery unless: -> { request.format.json? }
  
  layout :layout_by_resource

  # esto debe ser solo para api (y con checkeo de referrer)
  before_action :cors_set_access_control_headers
  before_action :cors_preflight_check

  def render_empty
    render html: '', :layout => 'application'
  end

  def user_session
    render json: { current_user: {
      email: current_user.email }
    }
  end

  def catch_all
    render_empty
  end

  private

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render :text => '', :content_type => 'text/plain'
    end
  end

  def layout_by_resource
    if devise_controller?
      "devise"
    else
      "application"
    end
  end

end
