# frozen_string_literal: true

module Events
  class ConversationsAssigned
    def self.perform(event)
      conversation = event.eventable
      return if conversation.assignee.bot?

      AssigneeMailer.notify(conversation).deliver_later

      EventTriggerProcessorJob.perform_later(
        id: conversation.app_id,
        event_id: event.id
      )
    end
  end
end
