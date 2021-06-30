class Apps::TeamController < ApplicationController
	before_action :find_app
	before_action :set_settings_navigator

	def index
		@active_tab = 'team'
		@agents = @app.roles.includes(:agent)
			.where("agents.invitation_token": nil) # agents.with_attached_avatar.where(invitation_token: nil)
			.page(params[:page])
			.per(params[:per] || 2)
	end

	def edit
		@agent_role = @app.roles.find(params[:id])
		@agent = @agent_role.agent
		# binding.pry

		@agent.roles_for_current_app = @agent_role.access_list.split

		#authorize! agent, to: :update_agent?, with: AppPolicy, context: {
		#	role: app.roles.find_by(agent_id: current_user.id)
		#}

		#render turbo_stream: [
		#	turbo_stream.replace(
		#		"modal", 
		#		template: "apps/team/edit", 
		#		locals: { app: @app },
		#	),
		#]
	end

	def update

		@agent_role = @app.roles.find_by(id: params[:id])

		@agent = @agent_role&.agent

		#authorize! agent, to: :update_agent_role?, with: AppPolicy, context: {
		#		role: app.roles.find_by(agent_id: current_user.id)
		#}

		data = params.require(:agent).permit(
			:name,
			:email
		)

		roles = params[:agent][:roles]

		# this is a bad pattern, consider nested attribs on @agent_role
		if @agent_role.update(access_list: roles ) and @agent.update(data)
			flash.now[:notice] = "Place was updated!"
			render turbo_stream: [flash_stream]
			# redirect_to app_team_index_path(@app.key), notice: "epa!", status: 303
		else
			@agent.errors.add(:name, :blank, message: "cannot be nil")
			render "edit", status: 422
		end
	end

	def new
	end

	def create
		# authorize! app, to: :invite_user?, with: AppPolicy

		@agent = @app.agents.find_by(email: email)

		if agent.blank?
			@agent = Agent.invite!(email: email)
			@role = @app.roles.find_or_initialize_by(agent_id: @agent.id)
			@role.save
		else
			@agent.deliver_invitation
		end


	end
end
