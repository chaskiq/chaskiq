class Apps::ContactAvatarsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index; end

  def show; end

  def new; end

  def edit; end

  def update
    authorize! @app, to: :can_manage_app_settings?, with: AppPolicy

   if @app.update(resource_params)
    flash.now[:notice] = "styles updated"
   end

   render "show" 

  end

  def create; end

  def destroy; end

  private

  def resource_params
    params.require(:app).permit(
      avatar_settings_objects: [
        :style, 
        palette_objects: []
      ]
    )
  end
end
