# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/chat_notifier
class ChatNotifierPreview < ActionMailer::Preview
  def notify
    message = ConversationPart.find_by(key: params[:part_id])
    message = ConversationPartContent.last.conversation_part if message.blank?
    ChatNotifierMailer.notify(message)
  end
end
