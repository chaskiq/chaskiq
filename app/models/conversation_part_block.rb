# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  include Redis::Objects

  has_one :conversation_part, as: :messageable
  value :trigger_locked, expireat: lambda { Time.now + 5.seconds }

  def create_fase(app)
    return if self.blocks["app_package"].blank?

    # this right now only works for trusted plugins
    # this needs to be API hook compatible
    # add a proper setting on appPackage like, hook_url ?
    package_class_name = self.blocks["app_package"]
    klass = "MessageApis::#{package_class_name}".constantize rescue nil
    return if klass.blank?
    return unless klass.instance_methods.include?(:create_fase)

    # todo: look for a better method to query app packages
    klass =   app
              .app_package_integrations
              .joins(:app_package)
              .where("app_packages.name =?", package_class_name )
              .first.message_api_klass rescue nil

    data = klass.create_fase(self, klass)

    self.blocks["schema"] = data[:definitions]
    self.data = data[:values]
    self.save
  end

  def handled_data
    #if self.blocks["type"] == "app_package"
    #  self.blocks["app_package"]

    #  klass = "MessageApis::#{self.blocks["app_package"].classify}".constantize

    #  return klass.display_data(self.data) if klass.respond_to?(:display_data)
      
    #end
    self.data
  end

  def as_json(*)
    super.tap do |hash|
      hash['data'] = handled_data.as_json
    end
  end

  def replied?
    self.state == 'replied'
  end

  def save_replied(data)
    self.state = 'replied'
    self.data = data unless data.blank?
    conversation_part.notify_to_channels if save
  end
end
