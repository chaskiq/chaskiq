class Apps::ArticlesCollectionsController < ApplicationController
  before_action :find_app
  before_action :set_navigation
  before_action :find_article_setting
  before_action :check_plan

  def index
    @article_collections = @app.article_collections.order(:position)
  end

  def show
    @article_setting = @app.article_settings
    @article_collection = @app.article_collections.friendly.find(params[:id]) # .find(params[:id])
  end

  def new
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_collection = @app.article_collections.new
  end

  def edit
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_setting = @app.article_settings
    @article_collection = @app.article_collections.friendly.find(params[:id]) # .find(params[:id])
  end

  def create
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_collection = @app.article_collections.new(
      resource_params
    )
    if @article_collection.save
      flash.now[:notice] = t("status_messages.updated_success")
      # render turbo_stream: [flash_stream]
      redirect_to app_articles_collections_path(@app.key)
      # redirect_to app_team_index_path(@app.key), notice: "epa!", status: 303
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def update
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_setting = @app.article_settings
    @article_collection = @app.article_collections.friendly.find(params[:id]) # .find(params[:id])

    if @article_collection.update(resource_params)
      flash.now[:notice] = t("status_messages.updated_success")
      # render turbo_stream: [flash_stream]
      redirect_to app_articles_collections_path(@app.key), status: :see_other
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def destroy
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_collection = @app.article_collections.friendly.find(params[:id])
    if @article_collection.destroy
      flash.now[:notice] = t("status_messages.deleted_success")
      redirect_to app_articles_collections_path(@app.key)
    else
      flash[:error] = t("status_messages.deleted_error")
      render "show"
    end
  end

  def sort
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    article_collection = @app.article_collections
    id = params.dig("articles_collection", "section", "id")
    position = params.dig("articles_collection", "section", "position")

    collection = article_collection.find(id)
    collection.insert_at(position + 1)
    flash.now[:notice] = t("status_messages.updated_success")
    render turbo_stream: [flash_stream]
  end

  private

  def check_plan
    allowed_feature?("Articles")
  end

  def resource_params
    params.require(:article_collection).permit(:title, :description, :icon)
  end

  def find_article_setting
    @article_setting = @app.article_settings
  end

  def set_navigation
    @navigator = "apps/articles/navigator"
  end
end
