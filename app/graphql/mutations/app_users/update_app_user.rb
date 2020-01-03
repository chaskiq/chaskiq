# frozen_string_literal: true

module Mutations
  module AppUsers
    class UpdateAppUser < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      argument :app_key, String, required: true
      argument :options, Types::JsonType, required: true
      argument :id, Integer, required: true

      def resolve(app_key:, id:, options:)
        app = current_user.apps.find_by(key: app_key)

        permitted_options = options.permit(
          ["name", "email", "first_name", "last_name", "company"]
        )

        app_user = app.app_users.find(id)
        app_user.update(permitted_options) 
        { app_user: app_user }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end