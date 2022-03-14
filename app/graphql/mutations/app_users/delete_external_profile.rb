# frozen_string_literal: true

module Mutations
  module AppUsers
    class DeleteExternalProfile < Mutations::BaseMutation
      field :profile, Types::ExternalProfileType, null: false
      field :errors, Types::JsonType, null: false

      argument :app_key, String, required: true
      argument :id, String, required: true

      def resolve(app_key:, id:)
        app = current_user.apps.find_by(key: app_key)
        external_profile = app.external_profiles.find(id)
        authorize! app, to: :can_manage_users?, with: AppPolicy, context: { app: app }

        external_profile.delete

        { profile: external_profile, errors: external_profile.errors }
      end
    end
  end
end
