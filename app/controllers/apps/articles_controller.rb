class Apps::ArticlesController < ApplicationController
  before_action :find_app
  before_action :find_article, only: %i[show edit update destroy]
  before_action :check_plan, only: %i[update create]

  def index
    articles = @app.articles.order("id desc")
    articles = articles.send(resource_type) if resource_type
    @articles = articles.page(params[:page]).per(params[:per])
  end

  def show; end

  def new
    @article = @app.articles.new
    @article.build_article_content
    render "new"
  end

  def edit; end

  def create
    @article = @app.articles.new(resource_params)
    authorize! @article, to: :can_read_help_center?, with: AppPolicy, context: {
      user: current_agent
    }

    @article.assign_attributes(
      article_content_attributes: {
        html_content: nil,
        serialized_content: nil,
        text_content: nil
      }
    )

    if @article.save
      redirect_to app_article_path(@app.key, @article), status: :see_other
    else
      render "create"
    end
  end

  def update
    if params[:toggle] && !params["commit"]
      @article.toggle
      flash.now[:notice] = "Article state changed to #{@article.reload.state}"
      render "update" and return
    end

    I18n.with_locale(params[:locale] || I18n.default_locale) do
      @article.update(resource_params)
    end

    authorize! @article, to: :can_read_help_center?, with: AppPolicy, context: {
      user: current_agent
    }

    if @article.errors.blank?
      flash.now[:notice] = t("articles.updated_success")
      render turbo_stream: [flash_stream]
      # redirect_to app_article_path(@app.key, @article)
    else
      flash[:error] = t("articles.updated_error")
      render "show"
    end
  end

  def destroy
    authorize! @article, to: :can_read_help_center?, with: AppPolicy, context: {
      user: current_agent
    }

    if @article.destroy
      flash[:success] = t("status_messages.deleted_success")
    else
      flash[:error] = t("status_messages.deleted_error")
    end
    redirect_to objects_url
  end

  def add_uncategorized
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @articles = @app.articles.without_collection.page(params[:page]).per(params[:page])
    collection = @app.article_collections.friendly.find(params[:collection_id])
    section = begin
      @app.sections.friendly.find(params[:section_id])
    rescue StandardError
      nil
    end

    @app.articles.where(id: params[:article]).find_each do |a|
      a.update(collection: collection, section: section)
    end

    flash[:success] = t("status_messages.updated_success")
    redirect_to app_articles_collection_path(@app.key, params[:collection_id])
  end

  def uncategorized
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
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
