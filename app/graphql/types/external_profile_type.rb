

# frozen_string_literal: true

module Types
  class ExternalProfileType < Types::BaseObject
    # field :app, [Types::AppType], null: true
    field :id, String, null: true
    field :data, Types::JsonType, null: true
    field :provider, String, null: false
  end
end
