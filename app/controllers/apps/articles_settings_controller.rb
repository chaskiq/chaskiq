class Apps::ArticlesSettingsController < ApplicationController
  before_action :find_app
  before_action :set_navigation
  before_action :check_plan, only: [:update]

  def show
    @article_setting = @app.article_settings.presence || @app.build_article_settings
  end

  def index
    @article_setting = @app.article_settings.presence || @app.build_article_settings
  end

  def new
    @article_setting = @app.article_settings.presence || @app.build_article_settings
    render "new", layout: false
  end

  def update
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    @article_setting = @app.article_settings.presence || @app.build_article_settings

    new_language = params[:article_setting][:new_language]
    if new_language.present?
      flash.now[:notice] = "Laguage added"
      @article_setting.update(
        "site_description_#{new_language}": "",
        "site_title_#{new_language}": ""
      )
      @article_setting.translations.last.save
    else
      flash.now[:notice] = "Updated"
      @article_setting.update(resource_params)
    end
  end

  def destroy
    @article_setting = @app.article_settings
    translation = @article_setting.translations.find_by(locale: params[:lang])
    translation.destroy if translation.present?

    flash.now[:notice] = "Laguage removed"
    render "update"
  end

  private

  def check_plan
    allowed_feature?("Articles")
  end

  def resource_params
    lang_items = @article_setting.translations.map(&:locale).map do |o|
      [:"site_title_#{o}", :"site_description_#{o}"]
    end.flatten

    params.require(:article_setting).permit(
      :color,
      :twitter,
      :linkedin,
      :facebook,
      :header_image,
      :logo,
      :subdomain,
      :domain,
      :website,
      :google_code,
      :default_lang,
      lang_items
    )
  end

  def set_navigation
    @navigator = "apps/articles/navigator"
  end
end
