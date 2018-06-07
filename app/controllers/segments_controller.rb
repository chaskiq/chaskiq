class SegmentsController < ApplicationController
  before_action :find_app
  before_action :set_segment, only: [:edit, :update, :destroy]
  # GET /segments
  # GET /segments.json
  def index
    @segments = @app.segments.all + Segment.where("app_id is null")
  end

  # GET /segments/1
  # GET /segments/1.json
  def show
    s = Segment.where("app_id is null ").where(id: params[:id]).first
    @segment =  s.present? ? s : @app.segments.find(params[:id])
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
        format.json { render :show, status: :created }
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
        format.json { render :show, status: :ok }
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

  # DELETE /segments/1
  # DELETE /apps/:app_id/segments/:id/delete_predicate
  def delete_predicate
    @segment
    predicates = @segment.predicates.reject{|o| o.name == params[:predicate_name]}
    @segment.save

    if !@segment.errors.any?
      format.html { redirect_to app_segment_url(@app ,@segment), notice: 'Segment was successfully updated.' }
      format.json { render :show, status: :ok }
    else
      format.html { render :edit }
      format.json { render json: @segment.errors, status: :unprocessable_entity }
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
      params.require(:segment).permit! #(:name, predicates: [])
      #params.fetch(:segment, {:name, predicates: []}).permit!
    end
end
