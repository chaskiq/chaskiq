module Types
  class ConversationPartType < Types::BaseObject
    field :message, String, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :app_user, Types::AppUserType, null: true
    #field :conversation, Types::ConversationType, null: true
    field :source, String, null: true
    field :message_source, Types::CampaignType, null: true
    field :email_message_id, String, null: true
  end
end
