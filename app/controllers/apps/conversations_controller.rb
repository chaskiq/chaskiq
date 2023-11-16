class Apps::ConversationsController < ApplicationController
  before_action :find_app
  before_action :check_plan

  def index
    @filter = "opened"
    @sort = "newest"

    authorize! @app, to: :can_read_conversations?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @conversations = search_service.search

    if params[:page].present?
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

    authorize! @app, to: :can_read_conversations?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @conversation = @app.conversations.find_by(key: params[:id])


    if request.headers["Turbo-Frame"].present?
      render "show"
    else
      @conversations = search_service.search
      # use a lazy frame on index template to avoid this call
      @collection = @conversation.messages
                                 .order("id asc")
                                 .page(params[:page])
                                 .per(10)

      render "index"
    end
  end

  def sidebar
    session[:conversation_sidebar] = params[:open] || "false"

    @conversation = @app.conversations.find_by(key: params[:id])

    render "apps/conversations/sidebar", layout: false and return

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

  def new
    @app_user = @app.app_users.find(params[:app_user_id]) if params[:app_user_id]

    authorize! @app, to: :can_manage_conversations?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @conversation = @app.conversations.new(
      main_participant_id: @app_user&.id
    )

    render "new", layout: false
  end

  def edit
    @conversation = @app.conversations.find_by(key: params[:id])
    render "edit", layout: false
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

    authorize! @app, to: :can_manage_conversations?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }

    @conversation = @app.start_conversation(options)

    redirect_to app_conversation_path(@app.key, @conversation.key)
  end

  def update
    @conversation = @app.conversations.find_by(key: params[:id])

    authorize! @conversation, to: :can_manage_conversations?, with: AppPolicy, context: {
      app: @app,
      user: current_agent
    }
    case params[:step]
    when "state"
      menu_items_response("state", -> { @conversation.toggle_state })
    when "priorize"
      menu_items_response("priorize", -> { @conversation.toggle_priority })
    when "assignee"
      @agent = @app.agents.find(params[:conversation][:assignee_id])
      menu_items_response("assignee", lambda {
        @conversation.assign_user(@agent)

        @conversation.log_async(
          action: "assign_user",
          user: current_agent,
          data: { assignee: @agent.id },
          ip: request.remote_ip
        )

        true
      })
    when "tags"
      @conversation.tag_list = params[:conversation][:tag_list].reject(&:empty?)
      @conversation.save

      flash.now[:notice] = t("status_messages.updated_success")

      render turbo_stream: [
        flash_stream,
        turbo_stream.replace(
          "conversation-item-#{@conversation.key}",
          partial: "apps/conversations/conversation",
          locals: {
            conversation: @conversation,
            app: @app
          }
        ),
        turbo_stream.update("modal")
      ]
    end
  end

  private

  def check_plan
    allowed_feature?("Conversations")
  end

  def menu_items_response(item, method)
    if method.call
      render turbo_stream: [
        turbo_stream.replace(
          "conversation-#{item}-#{@conversation.key}",
          partial: "apps/conversations/menu_items/#{item}"
        ),
        turbo_stream.update("modal")
      ]
    end
  end

  def search_service
    session[:search_params] ||= {}
    session[:search_params] = session[:search_params].merge(search_params)

    Rails.logger.debug session[:search_params]

    # Use the merged parameters from the session
    @search_service ||= ConversationSearchService.new(
      options: {
        app: @app,
        per: 10,
        page: params["page"],
        term: params["term"],
        sort: session[:search_params]["sort"],
        tag: session[:search_params]["tag"],
        agent_id: session[:search_params]["agent_id"],
        channel_id: session[:search_params]["channel_id"]
      }
    )
  end

  # Use this method to fetch and sanitize parameters
  def search_params
    params.fetch(:conversation_search_service, {}).permit(
      :page, :term, :sort, :tag, :agent_id, :filter, :channel_id
    )
  end
end
