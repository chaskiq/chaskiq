class Apps::ArticlesCollectionsController < ApplicationController

	before_action :find_app
	before_action :set_navigation
	before_action :find_article_setting

	def index
		@article_collections = @app.article_collections.order(:position)
	end

	def show
		@article_setting = @app.article_settings
		@article_collection = @app.article_collections.friendly.find(params[:id]) #.find(params[:id])
	end

	def edit
		@article_setting = @app.article_settings
		@article_collection = @app.article_collections.friendly.find(params[:id]) #.find(params[:id])
	end

	def update
		@article_setting = @app.article_settings
		@article_collection = @app.article_collections.friendly.find(params[:id]) #.find(params[:id])
		
		if @article_collection.update(resource_params)
			flash.now[:notice] = "Place was updated!"
			# render turbo_stream: [flash_stream]
			redirect_to app_articles_collections_path(@app.key), notice: "epa!", status: 303
		else
			render "edit", status: 422
		end
	end

	def new
		@article_collection = @app.article_collections.new
	end
	
	def create
		@article_collection = @app.article_collections.new(params[:article_collection].permit!)
		if @article_collection.save
			flash.now[:notice] = "Place was updated!"
			#render turbo_stream: [flash_stream]
			redirect_to app_articles_collections_path(@app.key)
			# redirect_to app_team_index_path(@app.key), notice: "epa!", status: 303
		else
			render "edit", status: 422
		end
	end

	def destroy
		@article_collection = @app.article_collections.friendly.find(params[:id])
		if @article_collection.destroy
			flash.now[:notice] = "Place was updated!"
			redirect_to app_articles_collections_path(@app.key)
		else
			flash[:error] = "Something went wrong"
			render 'show'
		end
	end

	def sort
		article_collection = @app.article_collections
		id = params.dig("articles_collection", "section", "id")
		position = params.dig("articles_collection", "section", "position")

		collection = article_collection.find(id)
		collection.insert_at(position+1)
		flash.now[:notice] = "Place was updated!"
		render turbo_stream: [flash_stream]
	end

	private

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
