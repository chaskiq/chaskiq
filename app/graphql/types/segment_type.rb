module Types
  class SegmentType < Types::BaseObject
    field :app, [Types::AppType], null: true
    field :name, String, null: true
    field :properties, Types::JsonType, null: true
  end
end
