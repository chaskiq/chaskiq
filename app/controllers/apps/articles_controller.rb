class Apps::ArticlesController < ApplicationController
	before_action :find_app
	before_action :find_article, only: [:show, :edit, :update, :destroy]

	def index
		articles = @app.articles  
		articles = articles.send(resource_type) if resource_type
		@articles = articles.page(params[:page]).per(params[:per])
	end
	
	def show
	end

	def update

		I18n.with_locale(params[:locale] || I18n.default_locale) do
			resource_params = params.require(:article).permit(
				:serialized_content, 
				:title, 
				:description, 
				:author_id, 
				:article_collection_id,
				article_content_attributes: [:id, :serialized_content]
			)
			@article.update(resource_params)
		end

		if @article.errors.blank?
			flash[:success] = "Object was successfully updated"
			flash.now[:notice] = "Place was updated!"
			render turbo_stream: [flash_stream]
			#redirect_to app_article_path(@app.key, @article)
		else
			flash[:error] = "Something went wrong"
			render 'show'
		end
	end

	def create
		if @article.save
			flash[:success] = "Object successfully created"
			redirect_to @article
		else
			flash[:error] = "Something went wrong"
			render 'new'
		end
	end

	def destroy
		if @article.destroy
			flash[:success] = 'Object was successfully deleted.'
			redirect_to objects_url
		else
			flash[:error] = 'Something went wrong'
			redirect_to objects_url
		end
	end

	private


	def find_article
		@article = @app.articles.friendly.find(params[:id])
	end

	def resource_type
		case params[:kind]
		when "draft" then :drafts
		when "published" then :published
		else nil 
		end
	end
	
	
	
end
