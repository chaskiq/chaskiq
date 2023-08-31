# frozen_string_literal: true

module Types
  class ExternalProfileType < Types::BaseObject
    # field :app, [Types::AppType], null: true
    field :id, String, null: true
    field :app_user, Types::AppUserType, null: false
    field :data, Types::JsonType, null: true
    field :profile_id, String, null: true
    field :provider, String, null: false
  end
end
