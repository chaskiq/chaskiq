class Campaigns::MailingsController < ApplicationController

  before_action :find_app, except: [:test, :deliver, :premailer_preview]
  
  before_action :set_campaign, only: [
    :show, :edit, :update, :destroy, :preview
  ] #, if: ->{request.xhr?}

  # GET /campaigns
  # GET /campaigns.json
  def index
    @campaigns = collection
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
    @campaign = collection.new #.new(type: "UserAutoMessage")
    @campaign.add_default_predicate

    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "show" }
    end
  end

  # GET /campaigns/1/edit
  def edit
  end

  # POST /campaigns
  # POST /campaigns.json
  def create
    @campaign = collection.new(campaign_params)

    respond_to do |format|
      if @campaign.save
        #format.html { redirect_to @campaign, notice: 'Campaign was successfully created.' }
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

  def preview
    @campaign.apply_premailer(exclude_gif: true)
    render html: @campaign.compiled_template_for(@campaign.subscribers.first).html_safe, layout: false
  end

  def premailer_preview
    @app = App.find_by(key: params[:app_id])
    set_campaign
    render layout: false
  end

  def test
    @campaign.test_newsletter
    flash[:notice] = "test sended"
    redirect_to manage_campaigns_path()
  end

  def deliver
    @app = App.find_by(key: params["app_id"])
    @campaign = @app.campaigns.find(params[:id]) 
    @campaign.send_newsletter
    flash[:notice] = "newsletter sended"
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "show" }
    end
    #redirect_to manage_campaigns_path()
  end


  private

    def collection
      @app.campaigns
    end
    # Use callbacks to share common setup or constraints between actions.
    def set_campaign
      @campaign = collection.find(params[:id])
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