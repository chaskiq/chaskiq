# frozen_string_literal: true

module Events
  class EmailChanged
    def self.perform(event)
      user = event.eventable
      app = user.app

      ## this needs to be triggered in eventTrigger job!
      DataEnrichmentJob.perform_later(user_id: user.id) if app.gather_social_data && user.email.present?

      EventTriggerProcessorJob.perform_later(
        id: user.app_id,
        event_id: event.id
      )
    end
  end
end
