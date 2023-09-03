# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, String, null: true
    field :email, String, null: true
    field :avatar_url, String, null: true
    field :lang, String, null: true
    field :identifier_key, String, null: true
    field :kind, String, null: true
    field :new_messages, Int, null: true
    field :properties, Types::JsonType, null: true
    field :session_id, String, null: false
    field :session_value, String, null: true

    def session_value
      return nil if object[:email].blank?
      return nil if object[:kind] != "AppUser"

      options = { email: object[:email], type: object[:type] }
      CHASKIQ_VERIFIER.generate(options, purpose: :login)
    end
  end
end
