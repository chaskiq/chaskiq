# frozen_string_literal: true

module Mutations
  module AppUsers
    class CreateExternalProfile < Mutations::BaseMutation
      field :profile, Types::ExternalProfileType, null: false
      field :errors, Types::JsonType, null: false

      argument :app_key, String, required: true
      argument :user_id, String, required: true
      argument :provider, String, required: true
      argument :profile_id, String, required: true

      def resolve(app_key:, user_id:, provider:, profile_id:)
        app = current_user.apps.find_by(key: app_key)
        user = app.app_users.find(user_id)
        authorize! app, to: :can_manage_users?, with: AppPolicy, context: { app: app }

        profile = user.external_profiles.find_or_initialize_by(
          provider: provider,
          profile_id: profile_id
        )

        profile.save

        { profile: profile, errors: profile.errors }
      end
    end
  end
end
