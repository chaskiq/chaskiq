# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  include Redis::Objects

  has_one :conversation_part, as: :messageable
  value :trigger_locked, expireat: lambda { Time.now + 5.seconds }

  def handled_data
    if self.blocks["type"] == "app_package"
      self.blocks["app_package"]

      klass = "MessageApis::#{self.blocks["app_package"].capitalize}".constantize

      return klass.display_data(self.data) if klass.respond_to?(:display_data)
      
    end
    self.data
  end

  def as_json(*)
    super.tap do |hash|
      hash['data'] = handled_data.as_json
    end
  end

  def save_replied(data)
    self.state = 'replied'
    self.data = data unless data.blank?
    conversation_part.notify_to_channels if save
  end
end
