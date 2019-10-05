class EmailChatNotifierJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(conversation_part_id)
    message = ConversationPart.find(conversation_part_id)
    return if message.read?
    # TODO: handle notification of private notes with mentions (@)
    response = ChatNotifierMailer.notify(message).deliver_now
    if response.present?
      message.email_message_id = response.message_id
      message.save
    end
  end
end
