module Types
  class BotTaskType < Types::BaseObject
    field :id, Int, null: true
    field :title, String, null: true
    field :predicates, Types::JsonType, null: true
    field :paths, [Types::BotPathType], null: true
    field :state, String, null: true
    
  end
end
