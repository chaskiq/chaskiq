# frozen_string_literal: true

class AppPackage < ApplicationRecord
  has_many :app_package_integrations
  has_many :apps, through: :app_package_integrations

  acts_as_taggable

  store :settings, accessors: %i[
    definitions
    icon
    editor_definitions
    credentials
  ], coder: JSON

  def process_global_hook(params)
    self.message_api_klass.process_global_hook(params)
  end

  def message_api_klass
    @message_api_klass ||= "MessageApis::#{self.name.capitalize}".constantize
  end

end
