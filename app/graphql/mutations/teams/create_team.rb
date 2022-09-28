# frozen_string_literal: true

module Mutations
  module Teams
    class CreateTeam < Mutations::BaseMutation
      field :team, Types::TeamType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :description, String, required: false
      argument :name, String, required: true

      def resolve(app_key:, description:, name:)
        app = current_user.apps.find_by(key: app_key)

        authorize! app, to: :can_manage_teams?, with: AppPolicy, context: {
          app: app
        }

        team = app.teams.create(
          name: name,
          description: description
        )

        { team: team, errors: team.errors }
      end
    end
  end
end
