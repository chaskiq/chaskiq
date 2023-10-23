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
    @agent.update(agent_params)
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
