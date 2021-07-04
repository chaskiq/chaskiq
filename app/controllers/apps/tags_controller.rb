class Apps::TagsController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator

	def index
		@tags = @app.tag_list_objects
	end

	def new
		@tag = TagListRecord.new
	end

	def edit
		@tag = @app.tag_list_objects.find{|o| o.name == params[:id] }
	end

	def update
		@tag = @app.tag_list_objects.find{|o| o.name == params[:id] }
		@tag.assign_attributes(params[:tag_list_record].permit!)
		@app.tag_list = @app.tag_list_objects.as_json

		if @app.save
			flash.now[:notice] = "Place was updated!"
			redirect_to app_tags_path(@app.key)
		else
			render "new", status: 422
		end
	end

	def create
		@tag = TagListRecord.new
		@tag.assign_attributes(params[:tag_list_record].permit!)
		@app.tag_list_objects << @tag
		@app.tag_list = @app.tag_list_objects.as_json

		if @app.save
			flash.now[:notice] = "Place was updated!"
			redirect_to app_tags_path(@app.key)
		else
			render "new", status: 422
		end
	end

	def destroy
		@tags = @app.tag_list_objects.reject{|o| o.name == params[:id] }
		@app.tag_list = @tags.as_json
		@app.save
		flash.now[:notice] = "Place was updated!"
		redirect_to app_tags_path(@app.key)
	end
end
