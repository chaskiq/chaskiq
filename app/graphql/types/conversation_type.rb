# frozen_string_literal: true

module Types
  class ConversationType < Types::BaseObject
    # field :app, [Types::AppType], null: true
    field :assignee, Types::AppUserType, null: true

    field :id, Integer, null: true
    field :key, String, null: true
    field :reply_count, Integer, null: true
    field :priority, Boolean, null: true
    field :parts_count, Integer, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :main_participant, Types::AppUserType, null: true
    field :last_message, Types::ConversationPartType, null: true

    def last_message
      object.reload.messages.last
      #lazy_comment
    end

    def lazy_comment
      #object.reload.messages.last
      BatchLoader.for(object.reload.id).batch(default_value: nil) do |conversation_ids, loader|
        ConversationPart
        .where(conversation_id: conversation_ids)
        order("id desc")
        .each do |comment|
          loader.call(comment.conversation_id, comment)
        end
      end
    end

    def main_participant
      BatchLoader::GraphQL.for(object.main_participant_id).batch do |user_ids, loader|
        AppUser.where(id: user_ids).each { |user| loader.call(user.id, user) }
      end      
    end

    def assignee
      BatchLoader::GraphQL.for(object.assignee_id).batch do |user_ids, loader|
        Agent.where(id: user_ids).each { |user| loader.call(user.id, user) }
      end
    end

    field :state, String, null: true

    field :messages, Types::PaginatedConversationPartsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 5
    end

    def messages(per:, page:)
      @collection = object.messages
                          .order('id desc')
                          .page(page)
                          .per(per)
    end
  end
end
