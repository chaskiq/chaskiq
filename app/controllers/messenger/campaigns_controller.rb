class Messenger::CampaignsController < ApplicationController
  layout "messenger"
  before_action :authorize_messenger

  def show
    @campaign = @app.messages.find(params[:id])

    case @campaign.type
    when "Banner"
      render "show_banner"
    when "Tour"
      render "show_tour"
    end
  end

  def user_auto_messages
    ids = params[:ids].split(",")
    @campaigns = @app.user_auto_messages.find(ids)
  end
end
