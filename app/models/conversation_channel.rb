class ConversationChannel < ApplicationRecord
  belongs_to :conversation

  def notify_part(conversation: , part:)
    conversation.app.app_package_integrations.each do |pkg|
      pkg.message_api_klass.notify_message(
        conversation: conversation , 
        part: part,
        channel: self.provider_channel_id
      )
    end
  end
end
