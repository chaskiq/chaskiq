class Apps::ArticlesController < ApplicationController
	before_action :find_app

	def index
		articles = @app.articles  
		articles = articles.send(resource_type) if resource_type
		@articles = articles.page(params[:page]).per(params[:per])
	end
	
	def show
		@article = @app.articles.friendly.find(params[:id])
	end

	def update
		if @article.update_attributes(params[:object])
			flash[:success] = "Object was successfully updated"
			redirect_to @article
		else
			flash[:error] = "Something went wrong"
			render 'edit'
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

	def resource_type
		case params[:kind]
		when "draft" then :drafts
		when "published" then :published
		else nil 
		end
	end
	
	
	
end
