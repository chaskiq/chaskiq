class ConversationChannel < ApplicationRecord
  belongs_to :conversation

  def notify_part(conversation: , part:)

    pkg = conversation.app
                      .app_package_integrations
                      .joins(:app_package)
                      .where("app_packages.name =?", self.provider.capitalize)
                      .limit(1).first
    
    pkg.message_api_klass.notify_message(
      conversation: conversation , 
      part: part,
      channel: self.provider_channel_id
    )

  end
end
