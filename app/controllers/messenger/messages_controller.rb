class Messenger::MessagesController < ApplicationController
  def create
    @app = App.find_by(key: params[:messenger_id])
    author = @app.app_users.first
    conversation = author.conversations.find_by(key: params[:conversation_id])

    serialized_content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: params[:content] }] }] }
    sanitized_html = ActionController::Base.helpers.strip_tags(params[:content])

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
end
