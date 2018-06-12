class AppUsersController < ApplicationController


  def index
    @app = App.find_by(key: params[:app_id])
    @app_users = @app.app_users.page(params[:page]).per(20)
  end

  def show
    @app = App.find_by(key: params[:app_id])
    @app_user = @app.app_users.find(params[:id])
    render "show"
  end


end
