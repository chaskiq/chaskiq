# frozen_string_literal: true

module Types
  class AppPackageIntegrationType < Types::BaseObject
    field :id, String, null: true
    field :name, String, null: true
    field :definitions, Types::JsonType, null: true
    field :settings, Types::JsonType, null: true
    field :icon, String, null: true
    field :description, String, null: true
    field :state, String, null: true

    def self.authorized?(object, context)
      super && context[:current_user].is_a?(Agent) && context[:current_user].apps.include?(object.app)
    end

    def icon
      object.app_package.icon
    end

    def state
      object.app_package.state
    end

    def description
      object.app_package.description
    end

    def definitions
      object.app_package.definitions
    end

    def name
      object.app_package.name
    end
  end
end
