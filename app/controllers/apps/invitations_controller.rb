class Apps::InvitationsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index
    @active_tab = "invitations"
    @agents = @app.agents.invitation_not_accepted
                  .order("id desc")
                  .page(params[:page])
                  .per(params[:per] || 12)
  end

  def new
    @agent = @app.agents.new
  end

  def create
    authorize! @app, to: :can_manage_teams?, with: AppPolicy, context: {
      user: current_agent
    }
    @agent = @app.agents.find_by(email: params[:agent][:email])

    if @agent.blank?
      @agent = Agent.invite!(email: params[:agent][:email])
      @role = @app.roles.find_or_initialize_by(agent_id: @agent.id)
      if @role.save
        flash.now[:notice] = I18n.t("settings.team.invitation_success")
        # render turbo_stream: [flash_stream,  turbo_stream.update("modal")]
        respond_to do |format|
          format.html { app_invitations_path(@app.key) }
          format.turbo_stream { redirect_to app_invitations_path(@app.key) }
        end
        # redirect_to app_team_index_path(@app.key)
      else
        render "create", status: :unprocessable_entity
      end
    else
      @agent.deliver_invitation
      flash.now[:notice] = I18n.t("settings.team.invitation_success")
      respond_to do |format|
        format.html { app_invitations_path(@app.key) }
        format.turbo_stream { redirect_to app_invitations_path(@app.key) }
      end

      # render turbo_stream: [
      #  flash_stream,
      #  turbo_stream.update("modal")
      # ]
    end
  end

  def update
    @agent = @app.agents.find(params[:id])

    if @agent.blank?
      agent = Agent.invite!(email: params[:id])
      role = @app.roles.find_or_initialize_by(agent_id: @agent.id)
      role.save
    else
      @agent.deliver_invitation
    end

    #track_resource_event(agent, :agent_invite, nil, app.id)

    flash.now[:notice] = t("settings.team.invitation_success")
    render turbo_stream: [flash_stream]
  end
end
