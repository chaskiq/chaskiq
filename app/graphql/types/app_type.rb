module Types
  class AppType < Types::BaseObject
    field :key, String, null: true
    field :name, String, null: true
    field :state, String, null: true
    field :tagline, String, null: true
    field :preferences, Types::JsonType, null: true
    field :segments, [Types::SegmentType], null: true
    field :encryption_key, String, null: true
    field :app_users, [Types::AppUserType], null: true
    
    field :conversations, Types::PaginatedConversationsType, null:true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(per: , page:)
      @collection = object.conversations.left_joins(:messages)
                          .where.not(conversation_parts: {id: nil})
                          .distinct
                          .page(page)
                          .per(per)
    end

    field :conversation, Types::ConversationType, null:true do
      argument :id, Integer, required: false
    end

    def conversation(id:)
       object.conversations.find(id)
    end

    field :app_user, Types::AppUserType, null:true do
      argument :id, Integer, required: false
    end

    def app_user(id:)
      object.app_users.find(id)
    end


    field :campaigns,[ Types::CampaignType], null:true do
      argument :mode, String, required: false
    end

    def campaigns(mode:)
      collection = object.send(mode) if ["campaigns", "user_auto_messages", "tours" ].include?(mode)
      collection.page(1).per(20)
    end


    field :campaign, Types::CampaignType, null:true do
      argument :mode, String, required: false
      argument :id, Integer, required: false
    end

    def campaign(mode:, id:)
      collection = object.send(mode) if ["campaigns", "user_auto_messages", "tours" ].include?(mode)
      collection.find(id)
    end

  end
end
