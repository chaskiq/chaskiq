# frozen_string_literal: true

module Mutations
  module AppUsers
    class CreateAppUser < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      field :errors, Types::JsonType, null: false

      argument :app_key, String, required: true
      argument :options, Types::AnyType, required: true

      def resolve(app_key:, options:)
        app = current_user.apps.find_by(key: app_key)

        permitted_options = options.require(:app).permit(
          %w[name email first_name last_name phone company_name]
        ).to_hash.with_indifferent_access

        authorize! app, to: :can_manage_users?, with: AppPolicy, context: { app: app }

        permitted_options.merge!({ additional_validations: true })
        case options[:app][:contact_kind]
        when "AppUser"
          app_user = app.add_user(permitted_options)
        when "Lead"
          app_user = app.add_lead(permitted_options)
        end

        track_resource_event(app_user, :app_user_created, app_user.saved_changes) if app_user.errors.blank?

        { app_user: app_user, errors: app_user.errors }
      end

      def current_user
        context[:current_user]
      end

      def validate_app_user(user); end
    end
  end
end
