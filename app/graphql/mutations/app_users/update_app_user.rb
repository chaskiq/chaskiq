# frozen_string_literal: true

module Mutations
  module AppUsers
    class UpdateAppUser < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :options, Types::AnyType, required: true
      argument :id, String, required: true

      def resolve(app_key:, id:, options:)
        app = current_user.apps.find_by(key: app_key)

        permitted_options = options.permit(
          %w[name email first_name last_name company]
        )

        app_user = app.app_users.find(id)

        authorize! app_user, to: :can_manage_users?, with: AppPolicy, context: {
          app: app
        }

        app_user.update(permitted_options)

        track_resource_event(app_user, :app_user_updated, app_user.saved_changes) if app_user.errors.blank?

        { app_user: app_user }
      end

      def current_user
        context[:current_user]
      end

      def track_event(app_user, action)
        app_user.log_async(
          action: action,
          user: current_user,
          ip: context[:request].remote_ip
        )
      end
    end
  end
end
