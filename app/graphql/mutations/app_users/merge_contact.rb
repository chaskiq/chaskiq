# frozen_string_literal: true

module Mutations
  module AppUsers
    class MergeContact < Mutations::BaseMutation
      field :status, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :from, String, required: true
      argument :to, String, required: true

      def resolve(app_key:, from:, to:)
        app = current_user.apps.find_by(app_key: app_key)
        authorize! app, to: :can_manage_users?, with: AppPolicy, context: { app: app }
        source = app.app_users.find(id)
        destination = app.app_users.find(to)
        app.merge_contact(from: source, destination: to)
        { status: "ok" }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
