module Types
  class SegmentType < Types::BaseObject
    field :id ,Int, null: true
    #field :app, [Types::AppType], null: true
    field :name, String, null: true
    field :properties, Types::JsonType, null: true
    field :predicates, Types::JsonType, null: true
  end
end
