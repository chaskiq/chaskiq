module Types
  class ConversationType < Types::BaseObject
    field :app, [Types::AppType], null: true
    #field :assignee, [Types::UserType], null: true
    field :reply_count, Integer, null: true
    field :parts_count, Integer, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :main_participant, Types::AppUserType, null: true
    #def main_participant
    #  object.main_participant
    #end
    field :state, String, null: true
  end
end
