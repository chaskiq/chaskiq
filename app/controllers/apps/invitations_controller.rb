class Apps::InvitationsController < ApplicationController

	before_action :find_app
	before_action :set_settings_navigator


	def index
		@active_tab = 'invitations'
		@agents = @app.agents.invitation_not_accepted			
			.page(params[:page])
			.per(params[:per] || 2)
	end

	def update
		@agent = @app.agents.find(params[:id])
		flash[:notice] = t("settings.team.invitation_success")
		render turbo_stream: [flash_stream]
	end

	def new
		@agent = @app.agents.new
	end

	def create
		# authorize! app, to: :invite_user?, with: AppPolicy
		@agent = @app.agents.find_by(email: params[:agent][:email])

		if @agent.blank?
			@agent = Agent.invite!(email: params[:agent][:email])
			@role = @app.roles.find_or_initialize_by(agent_id: @agent.id)
			if @role.save
				flash.now[:notice] = I18n.t('settings.team.invitation_success')
				render turbo_stream: [flash_stream]
			else
				render "new", status: 422
			end
		else
			@agent.deliver_invitation
			flash.now[:notice] = I18n.t('settings.team.invitation_success')
			render turbo_stream: [flash_stream]
		end
	end
end
