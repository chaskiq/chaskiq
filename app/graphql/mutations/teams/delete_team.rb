# frozen_string_literal: true

module Mutations
  module Teams
    class DeleteTeam < Mutations::BaseMutation
      field :team, Types::TeamType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true

      # , lang:)
      def resolve(app_key:, id:)
        app = current_user.apps.find_by(key: app_key)
        team = app.teams.find(id)

        authorize! app, to: :can_manage_teams?, with: AppPolicy, context: {
          app: app
        }

        team.destroy

        {
          team: team,
          errors: team.errors
        }
      end
    end
  end
end
