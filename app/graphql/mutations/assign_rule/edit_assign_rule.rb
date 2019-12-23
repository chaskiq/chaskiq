# frozen_string_literal: true

module Mutations
  module AssignRule
    class EditAssignRule < Mutations::BaseMutation
      field :errors, Types::JsonType, null: true
      field :assignment_rule, Types::AssignmentRuleType, null: true

      argument :app_key, String, required: true
      argument :agent_id, String, required: true
      argument :title, String, required: true
      argument :active, String, required: true
      argument :rule_id, Integer, required: true
      argument :conditions, Types::JsonType, required: true

      def resolve(app_key:, agent_id:, title:, active:, rule_id:, conditions:)
        find_app(app_key)
        @agent = @app.agents.find(agent_id)
        assignment_rule = @app.assignment_rules.find(rule_id)
        assignment_rule.update(
          title: title,
          agent: @agent,
          conditions: conditions
        )

        {
          assignment_rule: assignment_rule,
          errors: assignment_rule.errors
        }
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
