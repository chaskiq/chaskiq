class Apps::ArticlesSettingsController < ApplicationController

	before_action :find_app
	before_action :set_navigation

	def show
		@article_setting = @app.article_settings.presence || @app.build_article_settings
	end

	def index
		@article_setting = @app.article_settings.presence || @app.build_article_settings
	end

	def update
		@article_setting = @app.article_settings.presence || @app.build_article_settings
	end


private
	def set_navigation
		@navigator = "apps/articles/navigator"
	end
	
end
