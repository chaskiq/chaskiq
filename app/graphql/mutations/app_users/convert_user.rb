# frozen_string_literal: true

module Mutations
  module AppUsers
    class ConvertUser < Mutations::BaseMutation
      field :status, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :email, String, required: true

      def resolve(app_key:, email:)
        #app = App.find_by(key: app_key)
        app_user = context[:get_app_user].call
        app_user.update(email: email) unless app_user.email.present?
        { status: "ok" }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
