class Apps::ArticlesController < ApplicationController
  before_action :find_app
  before_action :find_article, only: %i[show edit update destroy]
  before_action :check_plan, only: %i[update create]

  def index
    articles = @app.articles
    articles = articles.send(resource_type) if resource_type
    @articles = articles.page(params[:page]).per(params[:per])
  end

  def edit; end

  def show; end

  def new
    @article = @app.articles.new
    @article.build_article_content
    render "new"
  end

  def update
    I18n.with_locale(params[:locale] || I18n.default_locale) do
      @article.update(resource_params)
    end

    authorize! @article, to: :can_read_help_center?, with: AppPolicy

    if @article.errors.blank?
      flash[:success] = "Object was successfully updated"
      flash.now[:notice] = "Place was updated!"
      render turbo_stream: [flash_stream]
      # redirect_to app_article_path(@app.key, @article)
    else
      flash[:error] = "Something went wrong"
      render "show"
    end
  end

  def create
    @article = @app.articles.new(resource_params)
    authorize! @article, to: :can_read_help_center?, with: AppPolicy

    if @article.save
      flash[:success] = "Object successfully created"
      redirect_to app_article_path(@app.key, @article)
    else
      flash[:error] = "Something went wrong"
      render "new"
    end
  end

  def destroy
    authorize! @article, to: :can_read_help_center?, with: AppPolicy

    if @article.destroy
      flash[:success] = "Object was successfully deleted."
    else
      flash[:error] = "Something went wrong"
    end
    redirect_to objects_url
  end

  def add_uncategorized
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @articles = @app.articles.without_collection.page(params[:page]).per(params[:page])
    collection = @app.article_collections.friendly.find(params[:collection_id])
    section = begin
      @app.sections.friendly.find(params[:section_id])
    rescue StandardError
      nil
    end

    @app.articles.where(id: params[:article]).each do |a|
      a.update(collection: collection, section: section)
    end

    flash[:success] = "Object assigned"
    redirect_to app_articles_collection_path(@app.key, params[:collection_id])
  end

  def uncategorized
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @articles = @app.articles.without_collection.page(params[:page]).per(params[:page])
    render partial: "uncategorized_form"
  end

  private

  def check_plan
    allowed_feature?("Articles")
  end

  def resource_params
    params.require(:article).permit(
      :serialized_content,
      :title,
      :description,
      :author_id,
      :article_collection_id,
      article_content_attributes: %i[id serialized_content]
    )
  end

  def find_article
    @article = @app.articles.friendly.find(params[:id])
  end

  def resource_type
    case params[:kind]
    when "draft" then :drafts
    when "published" then :published
    end
  end
end
