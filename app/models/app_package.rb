# frozen_string_literal: true

class AppPackage < ApplicationRecord
  has_many :app_package_integrations
  has_many :apps, through: :app_package_integrations

  acts_as_taggable_on :tags, :capabilities

  store :settings, accessors: %i[
    definitions
    icon
    editor_definitions
    credentials
    initialize_url
    configure_url
    submit_url
    sheet_url
  ], coder: JSON

  # for authorizations
  def process_global_hook(params)
    self.message_api_klass.process_global_hook(params)
  end

  # message api
  def message_api_klass
    @message_api_klass ||= "MessageApis::#{self.name.classify}".constantize
  end

end
