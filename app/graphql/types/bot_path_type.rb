module Types
  class BotPathType < Types::BaseObject
    field :id, Int, null: true
    field :title, String, null: true
    field :key, String, null: true
    field :predicates, Types::JsonType, null: true
    field :steps, Types::JsonType, null: true
  end
end
