class Apps::SecurityController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator

	def index
	end
end
