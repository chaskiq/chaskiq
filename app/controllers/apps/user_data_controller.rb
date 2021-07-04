class Apps::UserDataController < ApplicationController

	before_action :find_app
	before_action :set_settings_navigator

	def index
		@data = (AppUser::ENABLED_SEARCH_FIELDS + AppUser::BROWSING_FIELDS).map do |item|
			{	
				"title"=> item['name'], 
				"subtitle"=> item['type']
			}
		end
		@custom_fields = @app.custom_fields_objects

	end

	def new
		@custom_field = CustomFieldRecord.new
	end

	def edit
		@custom_field = @app.custom_fields_objects.find{|o| o.name == params[:id] }
	end

	def update
		@custom_field = @app.custom_fields_objects.find{|o| o.name == params[:id] }
		@custom_field.assign_attributes(params[:tag_list_record].permit!)
		@app.custom_fields = @app.custom_fields_objects.as_json

		if @app.save
			flash.now[:notice] = "Place was updated!"
			redirect_to app_tags_path(@app.key)
		else
			render "new", status: 422
		end
	end

	def create
		@custom_field = CustomFieldRecord.new
		@custom_field.assign_attributes(params[:tag_list_record].permit!)
		@app.custom_fields_objects << @custom_field
		@app.custom_fields = @app.custom_fields_objects.as_json

		if @app.save
			flash.now[:notice] = "Place was updated!"
			redirect_to app_tags_path(@app.key)
		else
			render "new", status: 422
		end
	end

	def destroy
		@custom_fields = @app.custom_fields_objects.reject{|o| o.name == params[:id] }
		@app.custom_fields = @custom_fields.as_json
		@app.save
		flash.now[:notice] = "Place was updated!"
		redirect_to app_tags_path(@app.key)
	end

end
