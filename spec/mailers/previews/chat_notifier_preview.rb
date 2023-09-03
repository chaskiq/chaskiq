# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/chat_notifier
# http://localhost:3000/rails/mailers/chat_notifier/notify?part_id=W2nuq8Y37MSkaHFAyFHsecGm
class ChatNotifierPreview < ActionMailer::Preview
  def notify
    message = ConversationPart.find_by(key: params[:part_id])
    message = ConversationPartContent.last.conversation_part if message.blank?
    ChatNotifierMailer.notify(message)
  end
end
