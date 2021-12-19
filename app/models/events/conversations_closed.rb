# frozen_string_literal: true

module Events
  class ConversationsClosed
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app

      EventTriggerProcessorJob.perform_later(
        id: conversation.app_id,
        event_id: event.id
      )

      app.app_metrics.create(kind: "solved_conversations")

      # AppIdentity.new(app.key)
      #           .solved_conversations
      #           .incr(1, Time.zone.now)

      diff = conversation.created_at - Time.zone.now

      app.app_metrics.create(kind: "resolution_avg")

      # AppIdentity.new(app.key)
      #           .resolution_avg
      #           .set(diff)
    end
  end
end
