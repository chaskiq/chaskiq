class AppsController < ApplicationController

  def show
    @app = App.find_by(key: params[:id])
    @segments = Segment.union_scope(
      @app.segments.all, Segment.where("app_id is null")
    ).order("id asc")

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

  def new
    @app = App.new
    respond_to do |format|
      format.html{ render_empty }
      format.json {render :show}
    end
  end
  

  def create
    @app = current_user.apps.create(params[:app].permit!)
    respond_to do |format|
      format.html{ render_empty }
      format.json {
        if @app.errors.blank?
          render :show
        else 
          render json: @app.errors, status: :unprocessable_entity
        end
      }
    end
  end

  def update
    @app = App.find_by(key: params[:id])
    @app.update_attributes(params[:app].permit!)

    @segments = Segment.union_scope(
      @app.segments.all, Segment.where("app_id is null")
    ).order("id asc")

    respond_to do |format|
      format.html{ render_empty }
      format.json {
        if @app.errors.blank?
          render :show
        else 
          render json: @app.errors, status: :unprocessable_entity
        end
      }
    end
  end

  

end

