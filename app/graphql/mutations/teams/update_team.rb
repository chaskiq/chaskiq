# frozen_string_literal: true

module Mutations
  module Teams
    class UpdateTeam < Mutations::BaseMutation
      field :team, Types::TeamType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :description, String, required: true
      argument :id, String, required: true
      argument :name, String, required: true

      def resolve(app_key:, description:, name:, id:)
        app = current_user.apps.find_by(key: app_key)
        team = app.teams.find(id)

        authorize! app, to: :can_manage_teams?, with: AppPolicy, context: {
          app: app
        }
        team.update(
          name: name,
          description: description
        )

        {
          team: team,
          errors: team.errors
        }
      end
    end
  end
end
