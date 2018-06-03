class ApplicationController < ActionController::Base

  protect_from_forgery unless: -> { request.format.json? }
  
  def render_empty
    render html: '', :layout => 'application'
  end

end
