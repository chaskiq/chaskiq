class Campaigns::AttachmentsController < ApplicationController

  skip_before_action :verify_authenticity_token
  before_action :find_campaign

  def index
    @attachments = @campaign.attachments.page(params[:page]).per(50)
    respond_to do |format|
      format.html
      format.json { render json: @attachments }
    end
  end

  def show
    @attachment = @campaign.attachments.find(params[:id])
  end

  def new
    @attachment = @campaign.attachments.new
  end

  def create
    create_attachment
    #@attachment = @campaign.attachments.create(resource_params)
    #respond_to do |format|
    #  format.html
    # format.json { render json: @attachment }
    #end
  end

protected

  def collection
    case params[:mode]
    when "campaigns"
      @app.campaigns
    when "user_auto"
      @app.user_auto_messages
    else
        case self.lookup_context.prefixes.first
        when "campaigns"
          @app.campaigns
        when "user_auto"
          @app.user_auto_messages   
        else
          raise "not in mode"
        end   
    end
  end

  def find_campaign
    @app      = current_user.apps.find_by(key: params[:app_id]) 
    @campaign = collection.find(params[:campaign_id])
  end

  def resource_params
    return [] if request.get?
    params[:attachment] = {} unless params[:attachment].present?
    params[:attachment][:image] = params[:image] if params[:image].present?
    params.require(:attachment).permit! #(:name)
  end

  def create_attachment
    if params[:file].present? or params[:url].present?

      # @attachment = @campaign.attachments.new
      # @attachment.user_id = @post.user.id
      if params[:file]
        filename = params[:file].original_filename
        content_type = params[:file].content_type
        if File.extname(filename).empty?
          params[:file].original_filename = "blob.#{ content_type.split("/").last}"
        end

        @attachment = @campaign.attachments.attach params[:file]
      
      elsif params[:url]
        handle = open(params[:url])
        name = "foo-#{Time.now.to_i}"
        
        @attachment = @campaign.attachments.attach(io: handle, filename: name, content_type: 'application/png')

        #@attachment = @campaign.attachments.attach new_file
      end
   
      if @campaign.save
        render json: { url: url_for(@campaign.attachments.last), resource: @campaign.attachments.last }
      else
        render json: {error: @campaign.errors}, status: 402
      end
    end
  end

end
