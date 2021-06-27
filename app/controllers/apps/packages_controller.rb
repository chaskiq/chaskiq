class Apps::PackagesController < ApplicationController

	before_action :find_app

	def index
	end

	def show
	end

	def create
	end

	def update
	end

	def capabilities
		@packages = @app.app_package_integrations
		.joins(:app_package)
		.where(
			app_package_id: @app.app_packages.tagged_with(params[:kind], on: "capabilities")
		).order("app_packages.name desc")
	end

	def configure
		@package = get_app_package

		@blocks = @package.call_hook({
			kind: 'configure',
			ctx: {
					lang: I18n.locale,
					current_user: current_agent
				}
		})

		render turbo_stream: turbo_stream.replace(
			"modal", 
			template: "apps/packages/configure", 
		)
	end

	def content
		@package = get_app_package

		@blocks = @package.call_hook({
			kind: 'content',
			ctx: {
					lang: I18n.locale,
					current_user: current_agent
				}
		})

		render turbo_stream: turbo_stream.replace(
			"modal", 
			template: "apps/packages/configure", 
		)
	end

	def sort

		a = @app.inbox_apps

		a.insert(
			params["section"]["position"], 
			a.delete_at( params["section"]["id"].to_i )
		)

		@app.update(inbox_apps: a)

		render turbo_stream: turbo_stream.replace(
			"conversation-sidebar-packages", 
			partial: "apps/packages/inbox_packages", 
		)

		# my_index = [1,3,5,7,9,2,4,6,8,10]
		# my_collection = [{"id"=>1}, {"id"=>4}, {"id"=>9}, {"id"=>2}, {"id"=>7}]
		# my_collection.sort_by{|x| my_index.index x['id'] }
		# [{"id"=>1}, {"id"=>7}, {"id"=>9}, {"id"=>2}, {"id"=>4}]
	end


	protected

	def get_app_package
		@app.app_package_integrations
		.joins(:app_package)
		.find_by("app_packages.name": params[:id])
	end

end

