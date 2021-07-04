class Apps::MessengerController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator


	def edit

	end

	def update
		flash[:notice] = "success!"

		if @app.update(params[:app].permit!)

			if params[:app][:new_language].present?
				render turbo_stream: [
					turbo_stream.replace(
						"translations_table", 
						partial: "apps/messenger/forms/translations_table"
					)
				] and return
			end
	
			render turbo_stream: [flash_stream]
		else 
			render 'edit'
		end
		
	end

	def sort_user_apps
		a = @app.user_home_apps

		a.insert(
			params["section"]["position"], 
			a.delete_at( params["section"]["id"].to_i )
		)

		@app.update(user_home_apps: a)

		render turbo_stream: turbo_stream.replace(
			"home-sortable", 
			partial: 'apps/messenger/forms/app_sortable',
			locals: {
				sortables: @app.user_home_apps
			} 
		)
	end

	def sort_visitor_apps
		a = @app.visitor_home_apps

		a.insert(
			params["section"]["position"], 
			a.delete_at( params["section"]["id"].to_i )
		)
		# @app.update(visitor_home_apps: a)

		render turbo_stream: turbo_stream.replace(
			"home-sortable", 
			partial: 'apps/messenger/forms/app_sortable',
			locals: {
				sortables: @app.user_home_apps
			} 
		)
	end
end
