# frozen_string_literal: true

class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app

  after_create :handle_registration

  store :settings, accessors: %i[
    api_key
    api_secret
    project_id
    access_token
    access_token_secret
    user_id
  ], coder: JSON

  validate do
    app_package.definitions.each do |definition|
      key = definition[:name].to_sym
      next unless self.class.stored_attributes[:settings].include?(key)
      errors.add(key, "#{key} is required") if send(key).blank?
    end
  end

  def handle_registration
    register_hook if message_api_klass and message_api_klass.respond_to?(:register_webhook)
  end

  def message_api_klass
    "MessageApis::#{app_package.name.capitalize}".constantize.new(self.settings) rescue nil
  end

  def register_hook
    klass = message_api_klass
    response = klass.register_webhook(app_package, self)
    klass.subscribe_to_events
  end

  def create_hook_from_params(params)
    klass = message_api_klass.create_hook_from_params(params, self)
  end

  def process_event(params)
    klass = message_api_klass.process_event(params, self)
  end

  def send_message(conversation, options)
    klass = message_api_klass.send_message(conversation, options)
  end
  
end
