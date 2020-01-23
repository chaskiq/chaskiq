# frozen_string_literal: true

module Events
  class EmailChanged
    def self.perform(event)
      user = event.eventable
      app = user.app
      
      ## this needs to be triggered in eventTrigger job!
      if app.gather_social_data && user.email.present?
        DataEnrichmentJob.perform_later(user_id: user.id)
      end

      EventTriggerProcessorJob.perform_later(id: app.id , event_id: event.id)
    end
  end
end