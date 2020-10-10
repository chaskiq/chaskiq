# frozen_string_literal: true

class EmailChatNotifierJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(conversation_part_id)
    message = ConversationPart.find_by(id: conversation_part_id)
    return unless message.present?
    # TODO: representation blocks for ConversationPartEvent / ConverationPartBlocks
    return unless message.message.is_a?(ConversationPartContent)
    return if message.read?
    return if message.conversation.app.outgoing_email_domain.blank?
    return if message.authorable.blank?
    # TODO: handle notification of private notes with mentions (@)
    response = ChatNotifierMailer.notify(message).deliver_now
    if response.present?
      message.email_message_id = response.message_id
      message.save
    end
  end
end
