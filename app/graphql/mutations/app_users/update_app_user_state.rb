# frozen_string_literal: true

module Mutations
  module AppUsers
    class UpdateAppUserState < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :state, String, required: true

      def resolve(app_key:, id:, state:)
        app = current_user.apps.find_by(key: app_key)
        app_user = app.app_users.find(id)

        authorize! app_user, to: :can_manage_user_state?, with: AppPolicy, context: { app: app }

        if AppUser.aasm.events.map(&:name).include?(state.to_sym)
          begin
            app_user.send(state.to_s.to_sym)
            app_user.save

            track_resource_event(app_user, :app_user_updated_state, app_user.saved_changes) if app_user.errors.blank?
          rescue AASM::InvalidTransition => e
            return { app_user: app_user, errors: [e.message] }
          end
        end

        { app_user: app_user }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
