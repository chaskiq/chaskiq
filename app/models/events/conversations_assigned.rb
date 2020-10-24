# frozen_string_literal: true

module Events
  class ConversationsAssigned
    def self.perform(event)
      conversation = event.eventable
      return if conversation.assignee.bot?

      AssigneeMailer.notify(conversation).deliver_later
    end
  end
end
