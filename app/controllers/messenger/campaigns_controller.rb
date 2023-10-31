class Messenger::CampaignsController < ApplicationController

  layout "messenger"
  before_action :authorize_messenger


  def show
    @campaign = @app.banners.find(params[:id])
  end
end



