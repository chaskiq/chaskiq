# frozen_string_literal: true

module Events
  class LeadsConvert
    def self.perform(event)
      conversation = event.eventable
      EventTriggerProcessorJob.perform_later(
        id: conversation.app_id, 
        event_id: event.id
      )
    end
  end
end
