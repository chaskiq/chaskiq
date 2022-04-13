# frozen_string_literal: true

module Mutations
  module AppUsers
    class ConvertUser < Mutations::BaseMutation
      field :status, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :email, String, required: true

      def resolve(app_key:, email:)
        # app = App.find_by(key: app_key)
        app_user = context[:get_app_user].call
        if app_user.email.blank?
          app_user.update(email:)
          app_user.become_lead! if app_user.is_a?(Visitor)

          track_resource_event(app_user, :app_user_converted, app_user.saved_changes) if app_user.errors.blank?
        end
        { status: "ok" }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
