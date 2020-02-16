# frozen_string_literal: true

module Types
  class AppPackageType < Types::BaseObject
    # field :id, String, null: true
    field :name, String, null: true
    field :definitions, Types::JsonType, null: true
    field :editor_definitions, Types::JsonType, null: true
    field :icon, String, null: true
    field :state, String, null: true
    field :description, String, null: true
  end
end
