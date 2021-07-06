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

end
