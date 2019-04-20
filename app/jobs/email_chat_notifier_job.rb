class EmailChatNotifierJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(conversation_part_id)
    message = ConversationPart.find(conversation_part_id)
    return if message.read?
    ChatNotifierMailer.notify(message).deliver_now
  end
end
