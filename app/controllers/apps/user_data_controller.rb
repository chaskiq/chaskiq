class Apps::UserDataController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator
  before_action :check_plan

  def index
    authorize! @app, to: :can_read_app_settings?, with: AppPolicy

    @data = (AppUser::ENABLED_SEARCH_FIELDS + AppUser::BROWSING_FIELDS).map do |item|
      {
        "title" => item["name"],
        "subtitle" => item["type"]
      }
    end
    @custom_fields = @app.custom_fields_objects
  end

  def new
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy

    @custom_field = CustomFieldRecord.new
  end

  def edit
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy

    @tag = @app.custom_fields_objects.find { |o| o.name == params[:id] }
  end

  def update
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy

    resource_params = params.require(:custom_field_record).permit(:name, :type)
    @custom_field = @app.custom_fields_objects.find { |o| o.name == params[:id] }
    @custom_field.assign_attributes(resource_params)
    @app.custom_fields = @app.custom_fields_objects.as_json

    if @app.save
      flash.now[:notice] = "Place was updated!"
      redirect_to app_user_data_path(@app.key)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def create
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy

    @custom_field = CustomFieldRecord.new
    resource_params = params.require(:custom_field_record).permit(:name, :type)

    @custom_field.assign_attributes(resource_params)
    @app.custom_fields_objects << @custom_field
    @app.custom_fields = @app.custom_fields_objects.as_json

    if @app.save
      flash.now[:notice] = "Place was updated!"
      redirect_to app_user_data_path(@app.key)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def destroy
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy

    @custom_fields = @app.custom_fields_objects.reject { |o| o.name == params[:id] }
    @app.custom_fields = @custom_fields.as_json
    @app.save
    flash.now[:notice] = "Place was updated!"
    redirect_to app_user_data_path(@app.key)
  end

  private

  def check_plan
    allowed_feature?("CustomAttributes")
  end
end
