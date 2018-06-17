class CampaignsController < ApplicationController
  before_action :find_app #, only: [:show, :edit, :update, :destroy]
  
  before_action :set_campaign, only: [:show, :edit, :update, :destroy]

  # GET /campaigns
  # GET /campaigns.json
  def index
    @campaigns = Campaign.all
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "index" }
    end
  end

  # GET /campaigns/1
  # GET /campaigns/1.json
  def show
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "show" }
    end
  end

  # GET /campaigns/new
  def new
    @campaign = Campaign.new
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "new" }
    end
  end

  # GET /campaigns/1/edit
  def edit
  end

  # POST /campaigns
  # POST /campaigns.json
  def create
    @campaign = @app.campaigns.new(campaign_params)

    respond_to do |format|
      if @campaign.save
        format.html { redirect_to @campaign, notice: 'Campaign was successfully created.' }
        format.json { render :show, status: :created, location: @campaign }
      else
        format.html { render :new }
        format.json { render json: @campaign.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /campaigns/1
  # PATCH/PUT /campaigns/1.json
  def update
    respond_to do |format|
      if @campaign.update(campaign_params)
        format.html { redirect_to @campaign, notice: 'Campaign was successfully updated.' }
        format.json { render :show, status: :ok, location: @campaign }
      else
        format.html { render :edit }
        format.json { render json: @campaign.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /campaigns/1
  # DELETE /campaigns/1.json
  def destroy
    @campaign.destroy
    respond_to do |format|
      format.html { redirect_to campaigns_url, notice: 'Campaign was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_campaign
      @campaign = @app.campaigns.find(params[:id])
    end

    def find_app
      @app = current_user.apps.find_by(key: params[:app_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def campaign_params
      params.require(:campaign).permit! 
      #(
      #  :from_name, 
      #  :from_email, 
      #  :reply_email, 
      #  :html_content, 
      #  :serialized_content, 
      #  :description, 
      #  :name, 
      #  :scheduled_at, 
      #  :segments,
      #  :subject,
      #  :timezone,
      #  :segments
      #)
    end
end
