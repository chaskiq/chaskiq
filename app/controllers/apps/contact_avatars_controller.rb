class Apps::ContactAvatarsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index; end

  def show; end

  def new; end

  def edit; end

  def update; end

  def create; end

  def destroy; end

  private

  def resource_params
    params.require(:quick_reply).permit(:title, :content)
  end
end
