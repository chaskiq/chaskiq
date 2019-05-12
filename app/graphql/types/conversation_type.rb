module Types
  class ConversationType < Types::BaseObject
    #field :app, [Types::AppType], null: true
    #field :assignee, [Types::UserType], null: true

    field :id, Integer, null: true
    field :reply_count, Integer, null: true
    field :parts_count, Integer, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :main_participant, Types::AppUserType, null: true
    field :last_message, Types::ConversationPartType, null: true

    def last_message
      object.messages.last.as_json(methods: [:app_user])
    end
    #def main_participant
    #  object.main_participant
    #end
    field :state, String, null: true

    field :messages, Types::PaginatedConversationPartsType, null:true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 5
    end

    def messages(per: , page:)
      @collection = object.messages.order("id asc")
                          .page(page)
                          .per(per)
    end


  end
end
