# frozen_string_literal: true

module Mutations
  module Teams
    class AddTeamAgent < Mutations::BaseMutation
      field :team, Types::TeamType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :agent_role_id, String, required: true

      # , lang:)
      def resolve(app_key:, id:, agent_role_id:)
        app = current_user.apps.find_by(key: app_key)
        team = app.teams.find(id)
        agent_role = app.agent_roles.find(agent_role_id)

        authorize! team, to: :can_manage_teams?, with: AppPolicy, context: {
          app: app
        }

        a = team.agents << agent_role

        {
          agent: a,
          errors: a.errors
        }
      end
    end
  end
end
