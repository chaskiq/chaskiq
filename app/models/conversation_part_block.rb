# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  has_one :conversation_part, as: :messageable

  def save_replied(data)
    self.state = 'replied'
    self.data = data
    conversation_part.notify_to_channels if save
  end
end
