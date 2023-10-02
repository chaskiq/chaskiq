class Messenger::ConversationsController < ApplicationController
  def index
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversations = @current_user.conversations

    render turbo_stream: [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversations_header",
                           locals: { app: @app, user: @current_user }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversations",
                          locals: {
                            app: @app,
                            conversations: @conversations,
                            user: @current_user
                          })
    ]
  end

  def show
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversation = @current_user.conversations.find_by(key: params[:id])

    collection = @conversation.messages
                              .visibles
                              .order("id desc")
                              .page(params[:page])
                              .per(10)

    render turbo_stream: [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversation_header",
                           locals: {
                             app: @app,
                             user: @current_user,
                             conversation: @conversation
                           }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversation",
                          locals: {
                            app: @app,
                            conversation: @conversation,
                            messages: collection,
                            user: @current_user
                          })
    ]
  end

  def new
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversation = @app.conversations.new

    # new_conversation_bots
    availability = @app.in_business_hours?(Time.zone.now)
    new_bot = @app.bot_tasks.get_welcome_bots_for_user(@current_user, availability)
    
    puts "OEOEOEOE"
    puts new_bot.as_json

    step = new_bot.settings["paths"].first["steps"].first

    message = {
      messageable: ConversationPartBlock.new(blocks: step["controls"]),
      source: nil,
      step_id: step["id"],
      trigger_id: new_bot.id,
      authorable: @app.agents.bots.first
    }

    @conversation.messages.new(message)

    render turbo_stream: [
      turbo_stream.replace("header-content",
                           partial: "messenger/conversations/conversation_header",
                           locals: {
                             app: @app,
                             user: @current_user,
                             conversation: @conversation
                           }),
      turbo_stream.update("bbbb",
                          partial: "messenger/conversations/conversation",
                          locals: {
                            app: @app,
                            user: @current_user,
                            conversation: @conversation,
                            messages: @conversation.messages
                          })
    ]
  end

  def create
    @app = App.find_by(key: params[:messenger_id])
    # TODO: check this, when permit multiple emails, check by different id
    author = @app.app_users.first # app.app_users.where(["email =?", current_user.email ]).first
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

      data = JSON.parse(message_reply)

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
