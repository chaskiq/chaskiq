class Apps::ConversationsController < ApplicationController
  before_action :find_app

  def index
    @filter = "opened"
    @sort = "newest"
    @conversations = search_service.search
                                   .includes(:main_participant)
                                   .page(params[:page]).per(10)

    if request.headers["Turbo-Frame"].present?
      render turbo_stream: [
        turbo_stream.append(
          "conversation-list-#{@app.key}",
          partial: "apps/conversations/conversation",
          collection: @conversations,
          locals: {
            app: @app
          }
        ),

        turbo_stream.replace(
          "conversation-list-pagination",
          partial: "apps/conversations/pagination"
        )
      ]
    else
      # format.html #{ redirect_to "/" }
      render "index"
    end
  end

  def search
    @filter = params.dig(:conversation_search_service, :filter).presence || "opened"
    @sort = params.dig(:conversation_search_service, :sort).presence || "newest"

    @conversations = search_service.search
    @conversations = @conversations
                     .includes(:main_participant)
                     .order("id desc")
                     .page(params[:page]).per(10)

    render turbo_stream: [

      turbo_stream.replace(
        "conversation-list-#{@app.key}",
        partial: "apps/conversations/collection"
      ),

      turbo_stream.replace(
        "conversation-search-fields",
        partial: "apps/conversations/search_filters",
        locals: {
          sort: @sort,
          filter: @filter
        }
      ),

      turbo_stream.replace(
        "conversation-list-pagination",
        partial: "apps/conversations/pagination"
      )
    ]
  end

  def show
    @filter = "opened"
    @sort = "newest"
    @conversation = @app.conversations.find_by(key: params[:id])
    @conversations = search_service.search
    @conversations = @conversations
                     .includes(:main_participant)
                     .page(params[:page]).per(10)

    if request.headers["Turbo-Frame"].present?
      turbo_stream.replace(
        "conversation",
        template: "apps/conversations/show",
        locals: { app: @app, conversation: @conversation }
      )
    else
      # use a lazy frame on index template to avoid this call
      @collection = @conversation.messages
                                 .order("id asc")
                                 .page(params[:page])
                                 .per(10)

      render "index"
    end
  end

  def sidebar
    if params[:q] == "cancel"
      render turbo_stream: turbo_stream.replace(
        "conversation-sidebar-packages",
        partial: "apps/packages/inbox_packages1", locals: {
          ctx: { conversation_key: @conversation.key }
        }
      )
    else
      render turbo_stream: turbo_stream.replace(
        "conversation-sidebar-packages",
        partial: "apps/packages/inbox_packages"
      )
    end
  end

  def update
    @conversation = @app.conversations.find_by(key: params[:id])

    case params[:step]
    when "state"
      menu_items_response("state",
                          -> { @conversation.update(state: params[:state] == "opened" ? "closed" : "opened") })
    when "priorize"
      menu_items_response("priorize", -> { @conversation.toggle_priority })
    when "assignee"
      @agent = @app.agents.find(params[:conversation][:assignee_id])
      menu_items_response("assignee", -> { @conversation.update(assignee_id: @agent.id) })
    when "tags"
      @conversation.tag_list = params[:conversation][:tag_list].reject(&:empty?)
      @conversation.save

      flash.now[:notice] = "Place was updated!"

      render turbo_stream: [
        flash_stream,
        turbo_stream.replace(
          "conversation-item-#{@conversation.key}",
          partial: "apps/conversations/conversation",
          locals: {
            conversation: @conversation,
            app: @app
          }
        )
      ]
    end
  end

  def edit
    @conversation = @app.conversations.find_by(key: params[:id])
  end

  def create
    author = @app.agents.where("agents.email =?", current_user.email).first
    participant = @app.app_users.find(params[:conversation][:main_participant])
    initiator_channel = params[:conversation][:initiator_channel]
    initiator_block = params[:conversation][:initiator_block]
    sanitized_html = ""
    subject = params[:conversation][:subject]

    options = {
      from: author,
      participant: participant,
      initiator_channel: initiator_channel,
      initiator_block: initiator_block,
      subject: subject,
      message: {
        html_content: sanitized_html,
        serialized_content: params[:serialized],
        text_content: params[:text] || ActionController::Base.helpers.strip_tags(params["html"])
      }
    }

    @conversation = @app.start_conversation(options)

    redirect_to app_conversation_path(@app.key, @conversation.key)
  end

  def new
    @app_user = @app.app_users.find(params[:app_user_id]) if params[:app_user_id]
    @conversation = @app.conversations.new(
      main_participant_id: @app_user&.id
    )
  end

  private

  def menu_items_response(item, method)
    if method.call
      render turbo_stream: [
        turbo_stream.replace(
          "conversation-#{item}-#{@conversation.key}",
          partial: "apps/conversations/menu_items/#{item}"
        )
      ]
    end
  end

  def search_service
    @search_service ||= ConversationSearchService.new(
      options: {
        app: @app,
        term: params.dig(:conversation_search_service, :term),
        sort: params.dig(:conversation_search_service, :sort),
        tag: params.dig(:conversation_search_service, :tag),
        agent_id: params.dig(:conversation_search_service, :agent_id)
      }
    )
  end
end
