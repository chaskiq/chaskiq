# frozen_string_literal: true

class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app

  store :settings, accessors: %i[
    api_key
    api_secret
    project_id
    access_token
    access_token_secret
  ], coder: JSON

  validate do
    app_package.definitions.each do |definition|
      key = definition[:name].to_sym
      next unless self.class.stored_attributes[:settings].include?(key)
      errors.add(key, "#{key} is required") if send(key).blank?
    end
  end


  def message_api_klass
    "MessageApis::#{app_package.name}".constantize.new(self.settings)
  end

  def handle_registration
    klass = message_api_klass
    url = CGI.escape("https://6404e5bc.ngrok.io/api/v1/hooks/#{app.key}/#{app_package.name.underscore}/#{self.id}")
    klass.register_webhook(url)
    klass.subscribe_to_events
  end
  
end
