# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/chat_notifier
class ChatNotifierPreview < ActionMailer::Preview

  def notify
    message = ConversationPart.last
    ChatNotifierMailer.notify(message)
  end

end
