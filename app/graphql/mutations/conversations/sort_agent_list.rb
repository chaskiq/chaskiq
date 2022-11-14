# frozen_string_literal: true

module Mutations
  module Conversations
    class SortAgentList < Mutations::BaseMutation
      field :list, [String], null: false

      argument :app_key, String, required: true
      argument :list, [String], required: true

      def resolve(app_key:, list:)
        find_app(app_key)

        authorize! @app, to: :can_manage_conversation_customizations?, with: AppPolicy

        @app.update(sorted_agents: list)

        {
          list: @app.sorted_agents
        }
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
