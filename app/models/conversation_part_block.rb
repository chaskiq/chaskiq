class ConversationPartBlock < ApplicationRecord

  has_one :conversation_part, as: :messageable

  def save_replied(data)
    self.state = "replied"
    self.data = data
    if self.save
      self.conversation_part.notify_to_channels
    end
  end

end
