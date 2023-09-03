class Apps::CampaignsController < ApplicationController
  before_action :find_app

  def index
    namespace = params[:namespace] || "campaigns"
    @collection = @app.send(namespace) if Message.allowed_types.include?(namespace)
    @collection = @collection.page(params[:page]).per(20)
  end

  def show
    @campaign = @app.messages.find(params[:id])
  end

  def edit
    @campaign = @app.messages.find(params[:id])
    render "show"
  end
end
