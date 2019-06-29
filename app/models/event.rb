class Event < ApplicationRecord

  EVENT_CONSTANTS = [
    {identifier: :user_created, name: "users.created"},

    {identifier: :conversation_opened, name: "conversations.added"},
    {identifier: :conversation_closed, name: "conversations.closed"},
    {identifier: :conversation_reopened, name: "conversations.reopened"},
    {identifier: :conversation_message_added, name: "conversations.part_added"},
    {identifier: :conversation_message_readed_by_agent, name: "conversations.agent.read"},
    {identifier: :conversation_message_readed_by_user, name: "conversations.user.read"},

    #{identifier: :campaign_viewed, name: "campaign.user.read"},
    #{identifier: :campaign_viewed, name: "campaign.user.read"},
    #{identifier: :campaign_viewed, name: "campaign.user.read"},
  ]

  belongs_to :eventable

  after_create :trigger_webhooks

  def trigger_webhooks
    puts "trigger hook on #{self.action}"
  end

  def self.action_for(name)
    ev = self::EVENT_CONSTANTS.find{|o| o[:identifier] == name }.try(:[], :name)
    raise "event \"#{name}\" constant missing" if ev.blank?
    ev
  end

end
