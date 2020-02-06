# frozen_string_literal: true

class ApiChannelNotificatorJob < ApplicationJob
  queue_as :default

  def perform(part_id:)
    ConversationPart.find(part_id).notify_message_on_available_channels
  end
end