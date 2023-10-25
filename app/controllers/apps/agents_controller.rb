class Apps::AgentsController < ApplicationController
  before_action :find_app

  def show
    @agent = @app.agents.find(params[:id])
    authorize! @app, to: :show?, with: AppPolicy
    @conversations = @agent.conversations.page(params[:page]).per(10) if params[:tab] == "conversations"
  end

  def edit
    @agent = @app.agents.find(params[:id])
    authorize! @app, to: :can_manage_profile?, with: AppPolicy
  end

  def update
    @agent = @app.agents.find(params[:id])
    authorize! @app, to: :can_manage_profile?, with: AppPolicy
    if @agent.update(agent_params)
      track_resource_event(current_agent, :agent_update, agent.saved_changes, app.id)
      # track_resource_event(current_agent, :agent_role_update, role.saved_changes, app.id) if role.errors.blank?
    end
  end

  private

  def agent_params
    params.require(:agent).permit(
      :first_name, :last_name, :avatar,
      :name, :area_of_expertise, :specialization,
      :phone_number, :address
    )
  end
end
