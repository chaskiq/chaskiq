# frozen_string_literal: true

module Mutations
  module AppUsers
    class UpdateExternalProfile < Mutations::BaseMutation
      field :profile, Types::ExternalProfileType, null: false
      field :errors, Types::JsonType, null: false

      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :profile_id, String, required: true

      def resolve(app_key:, id:, profile_id:)
        app = current_user.apps.find_by(key: app_key)
        external_profile = app.external_profiles.find(id)
        authorize! app, to: :can_manage_users?, with: AppPolicy, context: { app: app }

        external_profile.assign_attributes(
          profile_id: profile_id
        )

        external_profile.save

        { profile: external_profile, errors: external_profile.errors }
      end
    end
  end
end
