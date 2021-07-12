class Apps::ConversationMessagesController < ApplicationController
  before_action :find_app

  def index
    @conversation = @app.conversations.find_by(key: params[:conversation_id])
    @messages = @conversation.messages
                             .order("id desc")
                             .page(params[:page])
                             .per(2)

    puts "PAGES #{params[:page]} #{@messages.map(&:id)}"

    # [48302, 48301, 48300, 48299, 48298, 48297]
    # [48296, 48295, 48294, 48293, 48292, 48291]

    unless params[:page]
      render turbo_stream: [
        turbo_stream.replace(
          "conversation-messages",
          template: "apps/conversation_messages/index"
        )
      ]
    end

    if params[:page]
      render turbo_stream: [
        turbo_stream.append(
          "conversation-messages-list-#{@conversation.key}",
          partial: "apps/conversation_messages/part",
          collection: @messages,
          as: :message,
          locals: { app: @app, notified: false }
        ),
        turbo_stream.replace(
          "conversation-messages-list-pagination",
          partial: "apps/conversation_messages/pagination"
        )
      ]
    end
  end

  def create
    conversation = @app.conversations.find_by(key: params[:conversation_id])
    # author = @app.agents.where("agents.email =?", current_agent.email).first
    message = params[:conversation_message]
    options = {
      from: current_agent,
      message: {
        html_content: message["html"],
        serialized_content: message["serialized"],
        text_content: message["text"] || ActionController::Base.helpers.strip_tags(message["html"])
      }
    }

    @message = conversation.add_message(options)

    render turbo_stream: turbo_stream.prepend("conversation-messages-list-#{conversation.key}",
                                              partial: "apps/conversation_messages/part",
                                              locals: {
                                                message: @message,
                                                app: @app,
                                                notified: false # since we are creating a record to be seend for the agent we don't need to makr thid notified
                                              })
  end

  def update
    if params[:read]
      @conversation_part = @app.conversation_parts.find_by(key: params[:id])
      @conversation_part.read! if @conversation_part.present?
    end

    head :ok
  end
end
