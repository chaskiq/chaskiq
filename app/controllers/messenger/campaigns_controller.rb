class Messenger::CampaignsController < ApplicationController
  layout "messenger"
  before_action :authorize_messenger

  def show
    @campaign = @app.banners.find(params[:id])
  end

  def user_auto_messages
    ids = params[:ids].split(",")
    @campaigns = @app.user_auto_messages.find(ids)
  end
end
