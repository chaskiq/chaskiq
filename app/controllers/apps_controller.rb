class AppsController < ApplicationController

  def show
    @app = App.find_by(key: params[:id])
    respond_to do |format|
      format.html{ render_empty }
      format.json
    end
  end

  def index
    @apps = App.all
  end

  

end

