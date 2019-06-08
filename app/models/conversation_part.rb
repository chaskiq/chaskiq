class ConversationPart < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_user
  belongs_to :message_source, optional: true, class_name: "Message", foreign_key: :message_id

  after_create :enqueue_email_notification, unless: :send_constraints?

  scope :visibles, ->{ where("private_note is null")}

  def read!
    return if self.read?
    notify_read!
  end

  def read?
    self.read_at.present?
  end

  def notify_read!
    self.read_at = Time.now
    ConversationsChannel.broadcast_to("#{self.conversation.app.key}-#{self.conversation.id}", 
      self.as_json(only: [:id, :message, :conversation_id, :read_at], methods: [:app_user])
    ) if self.save
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
end
