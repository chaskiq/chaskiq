# frozen_string_literal: true

module Mutations
  module AssignRule
    class DeleteAssignRule < Mutations::BaseMutation
      field :errors, Types::JsonType, null: true
      field :assignment_rule, Types::AssignmentRuleType, null: true

      argument :app_key, String, required: true
      argument :rule_id, Integer, required: true

      def resolve(app_key:, rule_id:)
        find_app(app_key)
        assignment_rule = @app.assignment_rules.find(rule_id).destroy
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
