# frozen_string_literal: true

module Types
  class VisitType < Types::BaseObject
    field :url, String, null: true
    field :title, String, null: true
    field :os_version, String, null: true
    field :os, String, null: true
    field :browser_version, String, null: true
    field :browser_name, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
  end
end
