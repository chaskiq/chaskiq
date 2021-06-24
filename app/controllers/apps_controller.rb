class AppsController < ApplicationController

	def show
		@app = App.find_by(key: params[:id])
	end
end
