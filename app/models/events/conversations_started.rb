# frozen_string_literal: true

module Events
  class ConversationsStarted
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app
      
      #EventTriggerProcessorJob.perform_later(
      #  id: app.id , 
      #  event_id: event.id
      #)
    end
  end
end
