# frozen_string_literal: true

module Events
  class ConversationsAdded
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app
      AppIdentity.new(app.key)
                 .opened_conversations
                 .incr(1, Time.zone.now)

      EventTriggerProcessorJob.perform_later(
        id: app.id , 
        event_id: event.id
      )
    end
  end
end
