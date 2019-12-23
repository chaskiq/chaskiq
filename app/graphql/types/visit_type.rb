# frozen_string_literal: true

module Types
  class VisitType < Types::BaseObject
    field :url, String, null: true
    field :title, String, null: true
    field :os_version, String, null: true
    field :os, String, null: true
    field :browser_version, String, null: true
    field :browser_name, String, null: true
  end
end
