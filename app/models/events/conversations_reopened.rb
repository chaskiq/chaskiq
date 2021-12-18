# frozen_string_literal: true

module Events
  class ConversationsReopened
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app

      EventTriggerProcessorJob.perform_later(
        id: conversation.app_id,
        event_id: event.id
      )
    end
  end
end
