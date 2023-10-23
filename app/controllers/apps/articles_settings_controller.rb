class Apps::ArticlesSettingsController < ApplicationController
  before_action :find_app
  before_action :set_navigation
  before_action :check_plan

  def show
    @article_setting = @app.article_settings.presence || @app.build_article_settings
  end

  def index
    @article_setting = @app.article_settings.presence || @app.build_article_settings
  end

  def update
    authorize! @app, to: :can_manage_help_center?, with: AppPolicy, context: {
      app: @app
    }
    @article_setting = @app.article_settings.presence || @app.build_article_settings
    @article_setting.update(resource_params)
  end

  private

    
  def check_plan
    allowed_feature?("Articles")
  end

  def resource_params
    lang_items = @app.translations.map(&:locale).map do |o|
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
      lang_items
    )
  end

  def set_navigation
    @navigator = "apps/articles/navigator"
  end
end
