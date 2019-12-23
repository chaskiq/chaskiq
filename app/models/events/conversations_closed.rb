# frozen_string_literal: true

module Events
  class ConversationsClosed
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app

      AppIdentity.new(app.key)
                 .solved_conversations
                 .incr(1, Time.zone.now)

      diff = conversation.created_at - Time.now

      AppIdentity.new(app.key)
                 .resolution_avg
                 .set(diff)
    end
  end
end
