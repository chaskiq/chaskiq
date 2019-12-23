# frozen_string_literal: true

module Mutations
  module AssignRule
    class UpdateRulePriorities < Mutations::BaseMutation
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :rules, [Types::JsonType], required: true

      def resolve(app_key:, rules:)
        find_app(app_key)

        rules.each_with_index do |object, index|
          @app.assignment_rules.find(object['id']).update(priority: index + 1)
        end

        {
          errors: {}
        }
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
