module Types
  class AppType < Types::BaseObject
    field :key, String, null: true
    field :name, String, null: true
    field :state, String, null: true
    field :preferences, Types::JsonType, null: true
    field :encryption_key, String, null: true
    field :app_users, [Types::AppUserType], null: true
  end
end
