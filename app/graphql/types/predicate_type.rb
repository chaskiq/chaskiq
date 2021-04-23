# frozen_string_literal: true

module Types
  class PredicateType < Types::BaseObject
    field :type, String, null: true
    field :attribute, String, null: true
    field :comparison, String, null: true
    field :value, Types::JsonType, null: true
  end
end
