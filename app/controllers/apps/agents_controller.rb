class Apps::AgentsController < ApplicationController
  before_action :find_app

  def show
    @agent = @app.agents.find(params[:id])
    @conversations = @agent.conversations.page(params[:page]).per(10) if params[:tab] == "conversations"
  end

  def edit
    @agent = @app.agents.find(params[:id])
  end

  def update
    @agent = @app.agents.find(params[:id])
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
