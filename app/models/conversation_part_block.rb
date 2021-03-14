# frozen_string_literal: true

class ConversationPartBlock < ApplicationRecord
  include Redis::Objects

  has_one :conversation_part, as: :messageable
  value :trigger_locked, expireat: -> { Time.now + 5.seconds }

  def create_fase(app)
    return if blocks['app_package'].blank?

    # this right now only works for trusted plugins
    # this needs to be API hook compatible
    # add a proper setting on appPackage like, hook_url ?
    package_class_name = blocks['app_package']
    klass = begin
      "MessageApis::#{package_class_name}".constantize
    rescue StandardError
      nil
    end
    return if klass.blank?
    return unless klass.instance_methods.include?(:create_fase)

    # TODO: look for a better method to query app packages
    klass = get_package_integration(app, package_class_name)

    data = klass.create_fase(self, klass)

    blocks['schema'] = data[:definitions]
    self.data = data[:values]
    save
  end

  def get_package_integration(app, package_class_name)
    app
      .app_package_integrations
      .joins(:app_package)
      .where('app_packages.name =?', package_class_name)
      .first.message_api_klass
  rescue StandardError
    nil
  end

  def handled_data
    # if self.blocks["type"] == "app_package"
    #  self.blocks["app_package"]

    #  klass = "MessageApis::#{self.blocks["app_package"].classify}".constantize

    #  return klass.display_data(self.data) if klass.respond_to?(:display_data)

    # end
    data
  end

  def as_json(*)
    super.tap do |hash|
      hash['data'] = handled_data.as_json
    end
  end

  def replied?
    state == 'replied'
  end

  def save_replied(data)
    self.state = 'replied'
    self.data = data unless data.blank?
    conversation_part.notify_to_channels if save
  end
end
