class ConversationPart < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_user

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
end
