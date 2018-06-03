class SegmentsController < ApplicationController
  before_action :find_app
  before_action :set_segment, only: [:show, :edit, :update, :destroy]
  # GET /segments
  # GET /segments.json
  def index
    @segments = @app.segments.all
  end

  # GET /segments/1
  # GET /segments/1.json
  def show
    @segment = @app.segments.find(params[:id])
    @app_users = @segment.execute_query.page(params[:page]).per(20)
    respond_to do |format|
      format.html{ render_empty }
      format.json
    end
  end

  # GET /segments/new
  def new
    @segment = @app.segments.new
  end

  # GET /segments/1/edit
  def edit
  end

  # POST /segments
  # POST /segments.json
  def create
    @segment = @app.segments.new(segment_params)

    respond_to do |format|
      if @segment.save
        format.html { redirect_to app_segment_url(@app ,@segment), notice: 'Segment was successfully created.' }
        format.json { render :show, status: :created, location: @segment }
      else
        format.html { render :new }
        format.json { render json: @segment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /segments/1
  # PATCH/PUT /segments/1.json
  def update
    respond_to do |format|
      if @segment.update(segment_params)
        format.html { redirect_to app_segment_url(@app ,@segment), notice: 'Segment was successfully updated.' }
        format.json { render :show, status: :ok, location: @segment }
      else
        format.html { render :edit }
        format.json { render json: @segment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /segments/1
  # DELETE /segments/1.json
  def destroy
    @segment.destroy
    respond_to do |format|
      format.html { redirect_to app_segments_url(@app), notice: 'Segment was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

    def find_app
      @app = App.find_by(key: params[:app_id])
    end
    # Use callbacks to share common setup or constraints between actions.
    def set_segment
      @segment = @app.segments.find(params[:id])
    end

    # Never trust parameters from the scary internet, 
    # only allow the white list through.
    def segment_params
      #params.require(:segment).permit(predicates: [])
      params.fetch(:segment, {predicates: []}).permit!
    end
end
