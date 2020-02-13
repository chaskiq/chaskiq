# frozen_string_literal: true

module Mutations
  module AppUsers
    class SyncExternalProfile < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :provider, String, required: true

      def resolve(app_key:, id:, provider:)
        app = current_user.apps.find_by(key: app_key)
        app_user = app.app_users.find(id)

        profile = app_user.external_profiles.find_or_create_by(
          provider: provider.downcase
        )
        profile.sync

        { app_user: app_user }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
