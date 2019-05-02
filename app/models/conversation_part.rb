class ConversationPart < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_user
  belongs_to :message_source, optional: true, class_name: "Message", foreign_key: :message_id

  after_create :enqueue_email_notification

  def read!
    return if self.read?
    self.read_at = Time.now
    if self.save
      ConversationsChannel.broadcast_to("#{self.conversation.app.key}-#{self.conversation.id}", 
        self.as_json(only: [:id, :message, :conversation_id, :read_at], methods: [:app_user])
      )
    end
  end

  def read?
    self.read_at.present?
  end

  def enqueue_email_notification
    EmailChatNotifierJob
    .set(wait_until: 20.seconds.from_now)
    .perform_later(self.id)
  end
end
