class Apps::ArticlesSectionsController < ApplicationController
  before_action :find_app
  before_action :set_navigation
  before_action :find_article_setting
  before_action :find_article_collection, only: [:new]

  def index; end

  def new
    @article_section = @article_collection.sections.new
  end

  def show; end

  def edit
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @article_section = @article_collection.sections.new
  end

  def update
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @article_section = @app.sections.friendly.find(params[:id])
    if @article_section.errors.blank?
      flash.now[:notice] = "Place was updated!"
      # render turbo_stream: [flash_stream]
      redirect_to app_articles_collection_path(@app.key, @article_section)
    else
      flash[:error] = "Something went wrong"
      render "show"
    end
  end

  def create
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @article_collection = @app.article_collections.find(params[:collection_section][:article_collection_id])

    @article_section = @article_collection.sections.create(resource_params)

    if @article_section.errors.blank?
      flash.now[:notice] = "Place was updated!"
      # render turbo_stream: [flash_stream]
      redirect_to app_articles_collection_path(@app.key, @article_collection)
    else
      flash[:error] = "Something went wrong"
      render "new"
    end
  end

  def destroy
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @article_section = @app.sections.friendly.find(params[:id])

    if @article_section.destroy
      flash.now[:notice] = "Place was updated!"
      redirect_to app_articles_collection_path(@app.key, @article_section.collection)
    else
      flash[:error] = "Something went wrong"
      render "show"
    end
  end

  def sort
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    article = @app.articles.find(params[:section][:id])
    section_to = begin
      @app.sections.find(params[:section][:group_to])
    rescue StandardError
      nil
    end
    position = params[:section][:position] + 1

    article.update(section: section_to)
    article.insert_at(position)
    flash.now[:notice] = "Place was updated!"
    render turbo_stream: [flash_stream]
  end

  private

  def resource_params
    params.require(:collection_section).permit(
      :article_collection_id,
      :description,
      :icon,
      :title
    )
  end

  def find_article_collection
    @article_collection = @app.article_collections.friendly.find(params[:collection_id])
  end

  def find_article_setting
    @article_setting = @app.article_settings
  end

  def set_navigation
    @navigator = "apps/articles/navigator"
  end
end
