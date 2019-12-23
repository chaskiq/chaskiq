# frozen_string_literal: true

class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app

  store :settings, accessors: %i[
    api_key
    api_secret
    project_id
  ], coder: JSON

  validate do
    app_package.definitions.each do |definition|
      key = definition[:name].to_sym
      next unless self.class.stored_attributes[:settings].include?(key)

      errors.add(key, "#{key} is required") if send(key).blank?
    end
  end
end
