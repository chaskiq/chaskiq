class Apps::TeamGroupsController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  before_action :check_roles

  def index
    @teams = @app.teams.page(params[:page]).per(10)
  end

  def new
    @team = @app.teams.new
  end

  def edit
    @team = @app.teams.find(params[:id])
  end

  def create
    @team = @app.teams.create(resource_params)
    redirect_to app_team_groups_path(@app.key)
  end

  def update
    @team = @app.teams.find(params[:id])
    @team.update(resource_params)

    redirect_to app_team_groups_path(@app.key)
  end

  def destroy
    @team = @app.teams.find(params[:id])
    @team.destroy

    redirect_to app_team_groups_path(@app.key)
  end

  def participants
    @team = @app.teams.find(params[:id])

    @agent_team = @team.agent_teams.new

    if request.post?
      role = params[:agent_team][:role]
      @agent_team.role_id = role
      @agent_team.save

      @agent_team = @team.agent_teams.new
    end

    if request.delete?
      role = params[:role]
      agent_role = @team.agent_teams.find_by(role_id: role)
      agent_role.destroy
    end
  end

  private

  def check_roles
    authorize! current_agent, to: :can_manage_team?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
  end

  def resource_params
    params.require(:team).permit(:name, :description, :role)
  end
end
