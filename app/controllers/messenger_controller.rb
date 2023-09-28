class MessengerController < ApplicationController

  layout "messenger"

  def show
    @app = App.first
    @current_user = @app.app_users.first
    @home_apps = home_apps
  end

  def tester
    
  end

  def home_apps
    return @app.visitor_home_apps if @current_user.is_a?(Visitor)
    @app.user_home_apps
  end
end
