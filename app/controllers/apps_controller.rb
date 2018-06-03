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

  def search
    @app = App.find_by(key: params[:id])
    @segment = @app.segments.new
    resource_params = params.fetch(:data, {predicates: []}).permit!
    @segment.assign_attributes(resource_params)
    @app_users = @segment.execute_query
                         .page(params[:page])
                         .per(20)
  end

  

end

