# frozen_string_literal: true

class ConversationPart < ApplicationRecord
  include Tokenable
  belongs_to :conversation, touch: true
  # belongs_to :app_user, optional: true # todo: to be removed
  belongs_to :message_source, optional: true,
                              class_name: 'Message',
                              foreign_key: :message_id

  belongs_to :messageable, polymorphic: true, optional: true
  belongs_to :authorable, polymorphic: true, optional: true

  # has_one :conversation_part_content, dependent: :destroy

  after_create :assign_and_notify

  scope :visibles, -> { where('private_note is null') }

  attr_accessor :check_assignment_rules

  def from_bot?
    trigger_id.present? && step_id.present?
  end

  def is_event_message?
    messageable.is_a?(ConversationPartEvent)
  end

  def message
    # self.conversation_part_content
    messageable
  end

  def message=(message)
    # message should be a hash containing html_content,
    # serialized_content, text_content
    self.messageable = ConversationPartContent.create(message)
  end

  def event=(params = {})
    self.messageable = ConversationPartEvent.create(
      data: params[:data],
      action: params[:action]
    )
  end

  def controls=(blocks)
    self.messageable = ConversationPartBlock.create(blocks: blocks)
  end

  def conversation_part_content
    messageable if messageable.is_a?(ConversationPartContent)
  end

  def app_user
    authorable
  end

  def read!
    return if read?

    notify_read!
  end

  def read?
    read_at.present?
  end

  def notify_read!
    return if read_at.present?

    self.read_at = Time.now
    if save
      val = conversation.main_participant.new_messages.value
      conversation.main_participant.new_messages.decrement unless val < 1
      # TODO: decrement agent
      notify_to_channels
    end
  end

  def notify_to_channels
    notify_app_users unless private_note?
    notify_agents
  end

  def notify_agents
    EventsChannel.broadcast_to(
      conversation.app.key.to_s,
      type: :conversation_part,
      data: as_json
    )
  end

  def broadcast_key
    "#{conversation.app.key}-#{conversation.main_participant.session_id}"
  end

  def notify_app_users
    MessengerEventsChannel.broadcast_to(
      broadcast_key,
      type: 'conversations:conversation_part',
      data: as_json
    )

    MessengerEventsChannel.broadcast_to(
      broadcast_key,
      type: 'conversations:unreads',
      data: conversation.main_participant.new_messages.value
    )
  end

  def assign_and_notify
    increment_message_stats

    if authorable.is_a?(Agent) && !is_event_message? && !from_bot?
      conversation.main_participant.new_messages.increment
      conversation.update_first_time_reply
    end
    return if from_bot?

    assign_agent_by_rules unless conversation.assignee.present?
    enqueue_email_notification unless send_constraints?
  end

  def enqueue_email_notification
    # not send email it it's from user auto message campaign
    unless from_bot?
      EmailChatNotifierJob
        .set(wait_until: 20.seconds.from_now)
        .perform_later(id)
    end
  end

  def send_constraints?
    is_from_auto_message_campaign? || private_note? || is_event_message?
  end

  def is_from_auto_message_campaign?
    message_source.is_a? UserAutoMessage
  end

  def as_json(*)
    super.tap do |hash|
      hash['app_user'] = authorable.as_json
      hash['conversation_key'] = conversation.key
    end
  end

  def assign_agent_by_rules
    return if conversation_part_content.blank?

    serialized_content = conversation_part_content.serialized_content

    return if serialized_content.blank?

    text = JSON.parse(serialized_content)['blocks'].map { |o| o['text'] }.join(' ')

    app = conversation.app

    app.assignment_rules.each do |rule|
      next unless cond = rule.check_rule_for(text, self)

      conversation = self.conversation
      conversation.assign_user(rule.agent)
      break
    end
  end

  def increment_message_stats
    authorable.is_a?(Agent) ?
    increment_outgoing_messages_stat :
    increment_incoming_messages_stat
  end

  def increment_incoming_messages_stat
    AppIdentity.new(conversation.app.key)
               .incoming_messages.incr(1, created_at)
  end

  def increment_outgoing_messages_stat
    AppIdentity.new(conversation.app.key)
               .outgoing_messages.decr(1, created_at)
  end
end
