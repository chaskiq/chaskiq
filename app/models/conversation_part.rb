class ConversationPart < ApplicationRecord
  belongs_to :conversation, :touch => true
  #belongs_to :app_user, optional: true # todo: to be removed
  belongs_to :message_source, optional: true, 
                              class_name: "Message", 
                              foreign_key: :message_id


  belongs_to :messageable, polymorphic: true, optional: true
  belongs_to :authorable, polymorphic: true, optional: true

  has_one :conversation_part_content, dependent: :destroy

  after_create :enqueue_email_notification, unless: :send_constraints?

  scope :visibles, ->{ where("private_note is null")}

  #delegate :html_content, to: :conversation_part_content
  #delegate :serialized_content, to: :conversation_part_content
  #delegate :text_content, to: :conversation_part_content

  def message
    self.conversation_part_content
  end

  def message=(message)
    # message should be a hash containing html_content, 
    # serialized_content, text_content
    new_message = self.build_conversation_part_content(message)
    new_message.save
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
      ConversationsChannel.broadcast_to(
        "#{self.conversation.app.key}-#{self.conversation.id}", 
        self.as_json
      ) 

      EventsChannel.broadcast_to(
        "#{self.conversation.app.key}", 
        { 
          type: :conversation_part,
          data: self.as_json
        }
      ) 

    end
  end

  def enqueue_email_notification
    # not send email it it's from user auto message campaign
    EmailChatNotifierJob
    .set(wait_until: 20.seconds.from_now)
    .perform_later(self.id)
  end

  def send_constraints?
    is_from_auto_message_campaign? or self.private_note?
  end
  
  def is_from_auto_message_campaign?
    self.message_source.is_a? UserAutoMessage
  end

  def as_json(*)
    super.except("created_at", "updated_at").tap do |hash|
      hash["app_user"] = self.authorable.as_json
    end
  end
end
