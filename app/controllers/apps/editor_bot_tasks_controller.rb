class Apps::EditorBotTasksController < ApplicationController

  before_action :find_app

  def index
    @bot_tasks = @app.bot_tasks
  end
end
