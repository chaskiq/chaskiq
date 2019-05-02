class Campaigns::MetricsController < ApplicationController
  before_action :find_campaign

  def index
    @metrics = @campaign.metrics
                        .order("id desc")
                        .page(params[:page])
                        .per(20)
    render :index
  end

  def counts
    render json: @campaign.metrics.group(:action).count(:trackable_id)
  end

  def purge
    @campaign.metrics.delete_all
    render json: {}
  end

  def timeline
    @campaign.sparklines_by_day
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
end
