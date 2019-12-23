# frozen_string_literal: true

module Mutations
  module AppUsers
    class UpdateAppUserState < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :state, String, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, state:)
        app = current_user.apps.find_by(key: app_key)
        app_user = app.app_users.find(id)

        if AppUser.aasm.events.map(&:name).include?(state.to_sym)
          app_user.send("#{state}!".to_sym)
          app_user.save
        end

        { app_user: app_user }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
