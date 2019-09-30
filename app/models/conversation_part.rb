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

  def message
    #self.conversation_part_content
    self.messageable
  end

  def message=(message)
    # message should be a hash containing html_content, 
    # serialized_content, text_content
    self.messageable = ConversationPartContent.create(message)
    #new_message = self.build_conversation_part_content(message)
    #new_message.save
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
    self.read_at = Time.now
    if self.save
      notify_to_channels
    end
  end

  def notify_to_channels
    MessengerEventsChannel.broadcast_to(
      "#{self.conversation.app.key}-#{self.conversation.main_participant.session_id}",
      { 
        type: "conversations:conversation_part",
        data: self.as_json
      }
    )

    EventsChannel.broadcast_to(
      "#{self.conversation.app.key}", 
      { 
        type: :conversation_part,
        data: self.as_json
      }
    )
  end

  def assign_and_notify
    return self.from_bot?
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
    is_from_auto_message_campaign? or self.private_note?
  end
  
  def is_from_auto_message_campaign?
    self.message_source.is_a? UserAutoMessage
  end

  def as_json(*)
    super.tap do |hash|
      hash["app_user"] = self.authorable.as_json
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
        conversation.assignee = rule.agent
        conversation.save
        break
      end

    end
  end
end
