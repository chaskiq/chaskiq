# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  include Redis::Objects

  has_one :conversation_part, as: :messageable
  value :trigger_locked, expireat: lambda { Time.now + 5.seconds }

  def save_replied(data)
    self.state = 'replied'
    self.data = data
    conversation_part.notify_to_channels if save
  end
end
