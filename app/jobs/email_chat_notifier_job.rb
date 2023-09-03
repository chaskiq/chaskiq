# frozen_string_literal: true

class EmailChatNotifierJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(conversation_part_id)
    message = ConversationPart.find_by(id: conversation_part_id)
    return if message.blank?
    # TODO: representation blocks for ConversationPartEvent / ConverationPartBlocks
    return unless message.message.is_a?(ConversationPartContent)
    return if message.read?
    return if message.conversation.app.outgoing_email_domain.blank?
    return if message.authorable.blank?

    # TODO: handle notification of private notes with mentions (@)
    response = ChatNotifierMailer.notify(message).deliver_now
    if response.present?
      message_id = response.header[:ses_message_id]&.value
      return if message_id.blank?

      message.email_message_id = "#{message_id}@email.amazonses.com"
      message.save
    end
  end
end
