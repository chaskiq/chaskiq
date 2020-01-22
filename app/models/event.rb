# frozen_string_literal: true

class Event < ApplicationRecord
  EVENT_CONSTANTS = [
    { identifier: :user_created, name: 'users.created' },

    { identifier: :verified_lead, name: 'leads.verified' },

    { identifier: :conversation_started, name: 'conversations.started'},
    { identifier: :conversation_opened, name: 'conversations.added' },
    { identifier: :conversation_closed, name: 'conversations.closed' },
    { identifier: :conversation_reopened, name: 'conversations.reopened' },
    { identifier: :conversation_message_added, name: 'conversations.part_added' },
    { identifier: :conversation_message_readed_by_agent, name: 'conversations.agent.read' },
    { identifier: :conversation_message_readed_by_user, name: 'conversations.user.read' }

    # {identifier: :campaign_viewed, name: "campaign.user.read"},
    # {identifier: :campaign_viewed, name: "campaign.user.read"},
    # {identifier: :campaign_viewed, name: "campaign.user.read"},
  ].freeze

  belongs_to :eventable

  after_create :trigger_webhooks

  def trigger_webhooks
    action_event = 'Events::' + action.gsub('.', '_').classify
    klass = begin
              action_event.constantize
            rescue StandardError
              nil
            end

    if klass.blank?
      puts "no trigger hook for #{action}"
      return
    end

    puts "trigger hook on #{action}"
    klass.perform(self)
  end

  def self.action_for(name)
    ev = self::EVENT_CONSTANTS.find { |o| o[:identifier] == name }.try(:[], :name)
    raise "event \"#{name}\" constant missing" if ev.blank?

    ev
  end
end
