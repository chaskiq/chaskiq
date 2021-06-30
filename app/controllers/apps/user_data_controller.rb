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
	end

	def new
	end

	def edit
	end

	def create
	end

	def destroy
	end

end
