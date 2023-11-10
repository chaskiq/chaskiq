class Messenger::MessagesController < ApplicationController
  before_action :authorize_messenger

  def create
    author = @app_user
    conversation = author.conversations.find_by(key: params[:conversation_id])

    if params[:content]
      serialized_content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: params[:content] }] }] }
      sanitized_html = ActionController::Base.helpers.strip_tags(params[:content])
    end

    if params[:serialized]
      # TODO: validate this
      serialized_content = params[:serialized]
    end

    options = {
      from: author,
      message: {
        html_content: sanitized_html,
        serialized_content: serialized_content.to_json,
        text_content: params[:content]
      }
    }

    message = conversation.add_message(options)
  end

  def update
    author = @app_user
    @conversation = author.conversations.find_by(key: params[:conversation_id])
    @message = @conversation.messages.find_by(key: params[:id])

    # NOTE: that we might not be needed to receive step & trigger ar we already have them in the messge data.
    case params["event_type"]
    when "receive_conversation_part" then receive_conversation_part(author)

    end

    # receive_conversation_part(data, user)
  end

  def receive_conversation_part(user)
    data = {
      step: params[:step],
      trigger: params[:trigger],
      message_key: @message.key,
      conversation_key: @conversation.key
    }.with_indifferent_access

    # if @message.messageable.is_a?(ConversationPartBlock) &&
    #   @message.messageable.blocks["wait_for_input"] && params[:submit].blank?
    #  Rails.logger.debug "NOT PROCESSING RECEIVE CONVERSATION AS IT HAS WAIT FOR INPUT"
    #  return
    # end

    ActionTrigger.receive_conversation_part(@app, data, user)
  end
end
