class ConversationPart < ApplicationRecord
  include Tokenable
  belongs_to :conversation, :touch => true
  #belongs_to :app_user, optional: true # todo: to be removed
  belongs_to :message_source, optional: true, 
                              class_name: "Message", 
                              foreign_key: :message_id


  belongs_to :messageable, polymorphic: true, optional: true
  belongs_to :authorable, polymorphic: true, optional: true

  #has_one :conversation_part_content, dependent: :destroy

  after_create :assign_and_notify

  scope :visibles, ->{ where("private_note is null")}

  attr_accessor :check_assignment_rules

  def from_bot?
    self.trigger_id.present? && self.step_id.present?
  end

  def is_event_message?
    self.messageable.is_a?(ConversationPartEvent)
  end

  def message
    #self.conversation_part_content
    self.messageable
  end

  def message=(message)
    # message should be a hash containing html_content, 
    # serialized_content, text_content
    self.messageable = ConversationPartContent.create(message)
  end

  def event=(params={})
    self.messageable = ConversationPartEvent.create(
      data: params[:data], 
      action: params[:action]
    )
  end

  def controls=(blocks)
    self.messageable = ConversationPartBlock.create(blocks: blocks)
  end

  def conversation_part_content
    self.messageable if self.messageable.is_a?(ConversationPartContent)
  end

  def app_user
    self.authorable
  end

  def read!
    return if self.read?
    notify_read!
  end

  def read?
    self.read_at.present?
  end

  def notify_read!
    return if self.read_at.present?
    self.read_at = Time.now
    if self.save
      val = self.conversation.main_participant.new_messages.value
      self.conversation.main_participant.new_messages.decrement unless val < 1
      #todo: decrement agent
      notify_to_channels
    end
  end

  def notify_to_channels
    notify_app_users unless self.private_note?
    notify_agents
  end

  def notify_agents
    EventsChannel.broadcast_to(
      "#{self.conversation.app.key}", 
      { 
        type: :conversation_part,
        data: self.as_json
      }
    )
  end

  def broadcast_key
    "#{self.conversation.app.key}-#{self.conversation.main_participant.session_id}"
  end

  def notify_app_users
    MessengerEventsChannel.broadcast_to(
      broadcast_key,
      { 
        type: "conversations:conversation_part",
        data: self.as_json
      }
    )

    MessengerEventsChannel.broadcast_to(
      broadcast_key,
      { 
        type: "conversations:unreads",
        data: self.conversation.main_participant.new_messages.value
      }
    )
  end

  def assign_and_notify
    increment_message_stats

    if self.authorable.is_a?(Agent) && !is_event_message? && !self.from_bot?
      self.conversation.main_participant.new_messages.increment
      self.conversation.update_first_time_reply
    end
    return if self.from_bot?
    assign_agent_by_rules unless conversation.assignee.present?
    enqueue_email_notification unless send_constraints?
  end

  def enqueue_email_notification
    # not send email it it's from user auto message campaign
    EmailChatNotifierJob
    .set(wait_until: 20.seconds.from_now)
    .perform_later(self.id) unless self.from_bot?
  end

  def send_constraints?
    is_from_auto_message_campaign? or self.private_note? or self.is_event_message?
  end
  
  def is_from_auto_message_campaign?
    self.message_source.is_a? UserAutoMessage
  end

  def as_json(*)
    super.tap do |hash|
      hash["app_user"] = self.authorable.as_json
      hash["conversation_key"] = self.conversation.key
    end
  end

  def assign_agent_by_rules
    return if conversation_part_content.blank?

    serialized_content = conversation_part_content.serialized_content
    
    return if serialized_content.blank?

    text = JSON.parse(serialized_content)["blocks"].map{|o| o["text"]}.join(" ")

    app = conversation.app

    app.assignment_rules.each do |rule|
      if cond = rule.check_rule_for(text, self)
        conversation = self.conversation
        conversation.assign_user(rule.agent)
        break
      end

    end
  end

  def increment_message_stats
    self.authorable.is_a?(Agent) ?
    increment_outgoing_messages_stat :
    increment_incoming_messages_stat
  end

  def increment_incoming_messages_stat
    AppIdentity.new(self.conversation.app.key)
    .incoming_messages.incr(1, self.created_at) 
  end

  def increment_outgoing_messages_stat
    AppIdentity.new(self.conversation.app.key)
    .outgoing_messages.decr(1, self.created_at) 
  end
end
