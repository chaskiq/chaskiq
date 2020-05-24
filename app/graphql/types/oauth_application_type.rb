# frozen_string_literal: true

module Types
  class OauthApplicationType < Types::BaseObject
    field :name, String, null: true
    field :redirect_uri, String, null: true
    field :confidential, Boolean, null: true
    field :scopes, String, null: true
    field :uid, String, null: true
    field :secret, String, null: true
    field :owner_id, String, null: true
    field :owner_type, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
  end
end
