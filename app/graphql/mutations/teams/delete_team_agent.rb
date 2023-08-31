# frozen_string_literal: true

module Mutations
  module Teams
    class DeleteTeamAgent < Mutations::BaseMutation
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :agent_id, String, required: true

      # , lang:)
      def resolve(app_key:, id:, agent_id:)
        app = current_user.apps.find_by(key: app_key)
        team = app.teams.find(id)
        agent_role = app.roles.find_by(agent_id: agent_id)

        authorize! app, to: :can_manage_teams?, with: AppPolicy, context: {
          app: app
        }

        a = team.agent_teams.find_by(role_id: agent_role.id)
        a.delete

        {
          errors: a.errors
        }
      end
    end
  end
end
