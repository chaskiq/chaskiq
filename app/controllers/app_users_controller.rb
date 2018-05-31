class AppUsersController < ApplicationController


  def index
    @app = App.find_by(key: params[:app_id])
    @app_users = @app.app_users
  end


end
