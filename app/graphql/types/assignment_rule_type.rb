# frozen_string_literal: true

module Types
  class AssignmentRuleType < Types::BaseObject
    field :id, Int, null: false
    field :agent, Types::AgentType, null: true
    field :conditions, [Types::JsonType], null: true
    field :priority, Integer, null: true
    field :state, String, null: true
    field :title, String, null: true
  end
end
