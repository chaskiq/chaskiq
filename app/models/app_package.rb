# frozen_string_literal: true

class AppPackage < ApplicationRecord
  has_many :app_package_integrations
  has_many :apps, through: :app_package_integrations

  acts_as_taggable

  store :settings, accessors: %i[
    definitions
    icon
    editor_definitions
  ], coder: JSON
end
