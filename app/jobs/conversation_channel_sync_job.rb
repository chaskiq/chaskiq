# frozen_string_literal: true

class ConversationChannelSyncJob < ApplicationJob
  queue_as :default

  def perform(conversation_id:, app_package_id:)
    conversation = Conversation.find(conversation_id)
    pkg = AppPackageIntegration.find(app_package_id)

    pkg.message_api_klass.sync_messages_without_channel(conversation)
  end

end
