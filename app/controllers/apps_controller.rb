class AppsController < ApplicationController

  def show
    @app = App.find_by(key: params[:id])
    @segments = @app.segments.all + Segment.where("app_id is null")
    respond_to do |format|
      format.html{ render_empty }
      format.json
    end
  end

  def index
    @apps = App.all
    respond_to do |format|
      format.html{ render_empty }
      format.json
    end
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

