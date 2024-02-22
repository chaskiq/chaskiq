class Apps::TagsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index
    authorize! @app, to: :can_read_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @tags = @app.tag_list_objects
  end

  def new
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }
    @tag = TagListRecord.new
  end

  def edit
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @tag = @app.tag_list_objects.find { |o| o.name == params[:id] }
  end

  def create
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @tag = TagListRecord.new
    @tag.assign_attributes(resource_params)
    @app.tag_list_objects << @tag
    @app.tag_list = @app.tag_list_objects.as_json

    if @app.save
      flash.now[:notice] = t("status_messages.updated_success")
      redirect_to app_tags_path(@app.key)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def update
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @tag = @app.tag_list_objects.find { |o| o.name == params[:id] }
    @tag.assign_attributes(resource_params)
    @app.tag_list = @app.tag_list_objects.as_json

    if @app.save
      flash.now[:notice] = t("status_messages.updated_success")
      redirect_to app_tags_path(@app.key)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def destroy
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @tags = @app.tag_list_objects.reject { |o| o.name == params[:id] }
    @app.tag_list = @tags.as_json
    @app.save
    flash.now[:notice] = t("status_messages.deleted_success")
    redirect_to app_tags_path(@app.key)
  end

  def resource_params
    params.require(:tag_list_record).permit(:name, :color)
  end
end
