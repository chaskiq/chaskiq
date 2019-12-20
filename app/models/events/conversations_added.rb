module Events
  class ConversationsAdded

    def self.perform(event)
      conversation = event.eventable
      app = conversation.app
      AppIdentity.new(app.key)
      .opened_conversations
      .incr(1, Time.zone.now)
    end
  end
end