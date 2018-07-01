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

  def timeline
    @campaign.sparklines_by_day
  end


protected

  def find_campaign
    @app      = current_user.apps.find_by(key: params[:app_id]) 
    @campaign = @app.campaigns.find(params[:campaign_id])
  end
end
