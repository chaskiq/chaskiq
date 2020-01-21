# frozen_string_literal: true

module Events
  class ConversationsAdded
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app
      AppIdentity.new(app.key)
                 .opened_conversations
                 .incr(1, Time.zone.now)


      # query specific packages     
      app.app_package_integrations.each do |package|
        package.trigger(event)
      end
      
    end
  end
end
