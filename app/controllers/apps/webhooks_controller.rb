class Apps::WebhooksController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator

	def index
		@webhooks = @app.outgoing_webhooks.enabled if !params[:kind] || params[:kind] != "disabled"
		@webhooks = @app.outgoing_webhooks.disabled if params[:kind] == "disabled"
		@webhooks = @webhooks.page(params[:page]).per(params[:per])
	end

	def new
		@webhook = @app.outgoing_webhooks.new
	end

	def edit
		@webhook = @app.outgoing_webhooks.find(params[:id])
	end

	def create
		resource_params = params.require(:outgoing_webhook).permit(:state, :url, tag_list: [])
		@webhook = @app.outgoing_webhooks.new(resource_params)
		if @webhook.save
			flash.now[:notice] = I18n.t('settings.webhooks.create_success')
			#render turbo_stream: [
			#	flash_stream,
				#turbo_stream.replace(
				#	"app-settings", 
				#	template: "apps/webhooks/index"
				#)
			#]
			redirect_to app_webhooks_path(@app.key)
		else
			# I18n.t('settings.webhooks.create_error')
			render "new", status: 422
		end
	end

	def update
		resource_params = params.require(:outgoing_webhook).permit(:state, :url, tag_list: [])
		@webhook = @app.outgoing_webhooks.find(params[:id])
		if @webhook.update(resource_params)
			flash.now[:notice] = I18n.t('settings.webhooks.update_success')

 			redirect_to app_webhooks_path( 
				@app.key, 
				kind: @webhook.is_enabled ? 'enabled' : 'disabled' 
			)
			#render turbo_stream: [
			#	flash_stream,
			#	turbo_stream.replace(
			#		"app-settings", 
			#		template: "apps/webhooks/show"
			#	)
			#]
		else
			# I18n.t('settings.webhooks.update_error')
			render "new", status: 422
		end
	end

	def destroy
		@webhook = @app.outgoing_webhooks.find(params[:id])
		kind = @webhook.is_enabled ? 'enabled' : 'disabled' 

		if @webhook.destroy
			flash.now[:notice] = I18n.t('settings.webhooks.delete_success')
		end

		redirect_to app_webhooks_path( 
			@app.key, 
			kind: kind
		)
	end

end
