class ApplicationController < ActionController::Base

  def render_empty
    render html: '', :layout => 'application'
  end

end
