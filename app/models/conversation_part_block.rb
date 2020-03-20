# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  include Redis::Objects

  has_one :conversation_part, as: :messageable
  value :trigger_locked, expireat: lambda { Time.now + 5.seconds }

  before_create :create_fase

  def create_fase

    klass = "MessageApis::#{self.blocks["app_package"].capitalize}".constantize

    return unless klass.instance_methods.include?(:create_fase)

    # todo: look for a better method to query app packages
    klass = conversation_part.conversation
                              .app
                              .app_package_integrations
                              .joins(:app_package)
                              .where("app_packages.name =?", "Zoom")
                              .first.message_api_klass rescue nil

    data = klass.create_fase(self)

    self.data = data
  end

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
