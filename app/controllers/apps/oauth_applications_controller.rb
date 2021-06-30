class Apps::OauthApplicationsController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator
end
