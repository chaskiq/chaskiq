class ApplicationController < ActionController::Base

  protect_from_forgery unless: -> { request.format.json? }
  
  layout :layout_by_resource

  def render_empty
    render html: '', :layout => 'application'
  end

  def user_session
    render json: { current_user: {
      email: current_user.email }
    }
  end

  private

  def layout_by_resource
    if devise_controller?
      "devise"
    else
      "application"
    end
  end

end
