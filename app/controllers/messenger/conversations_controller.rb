class Messenger::ConversationsController < ApplicationController
  before_action :authorize_messenger

  def index
    @conversations = @app_user.conversations
                              .order("id desc")
                              .page(params[:page])
                              .per(5)

    index_views = [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversations_header",
                           locals: { app: @app, user: @app_user }),

      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversations",
                          locals: {
                            app: @app,
                            conversations: @conversations,
                            user: @app_user
                          })
    ]

    if params[:page]
      index_views = [
        turbo_stream.append("conversations-list",
                            partial: "messenger/conversations/conversation_row",
                            collection: @conversations,
                            as: :c,
                            locals: {
                              app: @app,
                              user: @app_user
                            }),
        turbo_stream.update("paginator-wrapper",
                            partial: "messenger/conversations/paginator",
                            locals: {
                              conversations: @conversations
                            })
      ]
    end

    render turbo_stream: index_views
  end

  def show
    @conversation = @app_user.conversations.find_by(key: params[:id])

    collection = @conversation.messages
                              .visibles
                              .order("id desc")
                              .page(params[:page])
                              .per(5)

    show_views = [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversation_header",
                           locals: {
                             app: @app,
                             user: @app_user,
                             conversation: @conversation
                           }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversation",
                          locals: {
                            app: @app,
                            conversation: @conversation,
                            messages: collection,
                            user: @app_user
                          })
    ]

    if params[:page]
      show_views = [
        turbo_stream.append("conversation-#{@conversation.key}",
                            partial: "messenger/messages/conversation_part",
                            collection: collection,
                            as: :message,
                            locals: {
                              app: @app,
                              user: @app_user
                            }),
        turbo_stream.update("paginator-wrapper",
                            partial: "messenger/messages/paginator",
                            locals: {
                              messages: collection
                            })
      ]
    end

    render turbo_stream: show_views
  end

  def new
    @conversation = @app.conversations.new

    # new_conversation_bots
    availability = @app.in_business_hours?(Time.zone.now)
    new_bot = @app.bot_tasks.get_welcome_bots_for_user(@app_user, availability)

    Rails.logger.debug "OEOEOEOE"
    Rails.logger.debug new_bot.as_json

    if new_bot.present?
      step = new_bot.settings["paths"].first["steps"].first

      message = {
        messageable: ConversationPartBlock.new(blocks: step["controls"]),
        source: nil,
        step_id: step["id"],
        trigger_id: new_bot.id,
        authorable: @app.agents.bots.first
      }

      @conversation.messages.new(message)
    end

    render turbo_stream: [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversation_header",
                           locals: {
                             app: @app,
                             user: @app_user,
                             conversation: @conversation
                           }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversation",
                          locals: {
                            app: @app,
                            user: @app_user,
                            conversation: @conversation,
                            messages: @conversation.messages
                          })
    ]
  end

  def create
    # TODO: check this, when permit multiple emails, check by different id
    author = @app_user # app.app_users.where(["email =?", current_user.email ]).first
    app_user = author
    participant = nil
    initiator_block = nil
    subject = nil
    initiator_channel = params[:initiator_channel]

    sanitized_html = ActionController::Base.helpers.strip_tags(params[:content])
    serialized_content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: params[:content] }] }] }

    options = {
      from: author,
      participant: participant,
      initiator_channel: initiator_channel,
      initiator_block: initiator_block,
      subject: subject,
      message: {
        html_content: sanitized_html,
        serialized_content: serialized_content.to_json,
        text_content: params[:content]
      }
    }

    # in reply block will create convo without append message
    if params["reply"].present?
      options = {
        from: author,
        participant: participant
      }
    end

    # creates conversation
    conversation = @app.start_conversation(options)
    # in reply mode we create separated message
    # maybe we could refactor this an put this into app.start_conversation method
    if params["reply"].present?
      trigger = @app.bot_tasks.find(params["trigger_id"])
      message_reply = params["reply"]
      first_step = trigger.paths[0]["steps"][0]
      step_uid = first_step["step_uid"]

      message = conversation.add_message(
        step_id: step_uid,
        trigger_id: trigger.id,
        from: @app.agent_bots.first,
        controls: first_step["controls"]
      )

      message_reply = params.permit(
        :trigger_id,
        :step_id,
        :event_type,
        :messenger_id,
        conversation: {},
        reply: %i[id label element next_step_uuid]
      )

      data = message_reply[:reply]

      message.message.save_replied(data)
      # initialize message
      attributes = {
        conversation_key: conversation.key,
        message_key: message.key,
        trigger: message.trigger_id,
        step: message.messageable.data["next_step_uuid"],
        reply: message.messageable.data
      }.with_indifferent_access

      ActionTrigger.trigger_step(
        attributes,
        @app,
        app_user
      )
    end

    # track_event(conversation, author)

    Rails.logger.debug conversation.as_json

    render turbo_stream: [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversation_header",
                           locals: {
                             app: @app,
                             user: author,
                             conversation: conversation
                           }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversation",
                          locals: {
                            app: @app,
                            user: author,
                            conversation: conversation,
                            messages: conversation.messages
                          })
    ]
  end
end
