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

    if params[:tab] == "audience"
      @segment_manager = SegmentManagerService.new(
        app: @app, 
        predicates: @bot.segments 
      )
      @collection = @segment_manager.results(params)  #resource_params["segment_predicate"]
    end


    case params[:mode]
    when "new-step"
      render "new_step" and return
    end
  end

  def update
    @bot = @app.bot_tasks.find(params[:id])

    if params[:tab] == "audience"
      segment_predicate = segment_params[:segments][:segment_predicate]
      segment_predicates = segment_predicate.keys.sort.map { |key| segment_predicate[key] }
      unless params[:new_segment].present?
        if params[:force_save] == "true"
          @bot.update(segments: segment_predicates)
        else
          @bot.assign_attributes(segments: segment_predicates)
        end
      end
      audience_handler
      @tab =  params[:tab]
      return
    end

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

  def segment_params
    params.require(:bot_task).permit(
    segments: {
      segment_predicate: [
        :type,
        :attribute,
        :comparison,
        { value: [] }, # This permits the value as an array
        :value # This permits the value as a scalar (e.g., string)
      ]
    })
  end

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

  def audience_handler
    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @bot.segments
    )

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    @collection = @segment_manager.results({
                                             page: params[:page],
                                             per: 5
                                           })
  end
end
