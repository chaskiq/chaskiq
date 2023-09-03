class Apps::BotsController < ApplicationController
  before_action :find_app

  def index
    redirect_to leads_app_bots_path(@app.key)
  end

  def show
    @bot = @app.bot_tasks.find(params[:id])
  end

  def new
    @bot = @app.bot_tasks.new
    # params.permit(:title, :paths, :bot_type)
  end

  def edit
    @bot = @app.bot_tasks.find(params[:id])
    @collection = @bot.metrics.page(params[:page]).per(params[:per])

    case params[:mode]
    when "new-step"
      render "new_step" and return
    end
  end

  def update
    @bot = @app.bot_tasks.find(params[:id])

    case params[:mode]
    when "add-path"
      bot_path = BotPath.new title: params[:bot_path][:title]
      @bot.paths = @bot.paths << bot_path.as_json
      render turbo_stream: [
        turbo_stream.replace(
          "bot-task-editor",
          partial: "apps/bots/editor"
        )
      ]
    else
      resource_params = params.require(:bot_task).permit! # (:name, :scheduling)
      @bot.update(resource_params)
      render "edit"
    end
  end

  def create
    @bot = @app.bot_tasks.create(
      params.require(:bot_task).permit(:title, :paths, :bot_type)
    )
    redirect_to app_bots_path(@app.key)
    # params.permit(:title, :paths, :bot_type)
  end

  def sort
    mode = params[:mode]
    id = params[:section][:id]
    position = params[:section][:position]

    collection = @app.bot_tasks.for_new_conversations if mode == "new_conversations"
    collection = @app.bot_tasks.for_outbound if mode == "outbound"

    @bot_task = collection.find(id)
    @bot_task.insert_at(position + 1)

    head :ok
  end

  def users
    render "show"
  end

  def leads
    render "show"
  end

  def outbound
    collection_finder
    render :index
  end

  def new_conversations
    collection_finder
    render :index
  end

  private

  def handle_bot_tasks_filters(filters, collection)
    return collection if filters["users"].blank?

    ors = nil
    filters["users"].each_with_index do |filter, _index|
      ors = ors.nil? ? BotTask.infix([filter]) : ors.or(BotTask.infix([filter]))
    end
    collection = collection.where(ors) if ors.present?
  end

  def collection_finder
    mode = action_name # params[:mode]
    filters = params[:filters] ||= {}

    collection = @app.bot_tasks
    collection = @app.bot_tasks.for_new_conversations if mode == "new_conversations"
    collection = @app.bot_tasks.for_outbound if mode == "outbound"
    collection = collection.where(state: filters["state"]) if filters["state"].present?
    @collection = handle_bot_tasks_filters(filters, collection).ordered
  end
end
