class Apps::EditorBotTasksController < ApplicationController
  before_action :find_app

  def index
    @bot_tasks = @app.bot_tasks
  end


  def create
    authorize! @app, to: :can_read_routing_bots?, with: AppPolicy
    q = params[:q]

    @bot_tasks = if q.present?
                       @app.bot_tasks
                           .ransack(name_cont: q)
                           .result(distinct: true)
                     else
                       @app.bot_tasks
                     end
  end
end
