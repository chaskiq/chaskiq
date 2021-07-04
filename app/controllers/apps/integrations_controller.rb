class Apps::IntegrationsController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator


	def index
		if params[:kind] == "available"
			#authorize! object, to: :manage?, with: AppPolicy
			integrations = @app.app_package_integrations.map(&:app_package_id)
			if integrations.any?
				@app_packages = AppPackage.where.not("id in(?)", integrations)
			else
				@app_packages = AppPackage.all
			end
		elsif params[:kind] == "yours"
			@agent_app_packages = current_agent.app_packages
		else
			@integrations = @app.app_package_integrations
			@integrations = @integrations	
		end
	end

	def edit		
		@integration = @app.app_package_integrations.find(params[:id])
	end

	def new		
		@app_package = AppPackage.find(params[:app_package])
		@integration = @app.app_package_integrations.new( app_package: @app_package )
	end

	def update		
		@integration = @app.app_package_integrations.find(params[:id])
		resource_params = params[:app_package_integration].permit!
		if @integration.update(resource_params)
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key)
		else
			render "edit", status: 422
		end
	end

	def create		
		resource_params = params[:app_package_integration].permit!
		@integration = @app.app_package_integrations.new
		if @integration.update(resource_params)
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key)
		else
			render "new", status: 422
		end
	end

	def destroy
		@integration = @app.app_package_integrations.find(params[:id])
		if @integration.destroy
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key)
		end
	end
end
