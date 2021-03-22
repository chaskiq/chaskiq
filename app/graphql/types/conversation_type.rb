# frozen_string_literal: true

module Types
  class ConversationType < Types::BaseObject
    field :assignee, Types::AppUserType, null: true
    # association_field :assignee, Types::AgentType, null: true

    field :id, Integer, null: true
    field :key, String, null: true
    field :reply_count, Integer, null: true
    field :priority, Boolean, null: true
    field :parts_count, Integer, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true

    field :first_agent_reply, GraphQL::Types::ISO8601DateTime, null: true
    field :latest_user_visible_comment_at, GraphQL::Types::ISO8601DateTime, null: true

    field :main_participant, Types::AppUserType, null: true
    # association_field :main_participant, Types::AppUserType, null: false

    field :last_message, Types::ConversationPartType, null: true

    field :tag_list, [String], null: true

    def tag_list
      object.tags.to_a.map(&:name)
    end

    field :conversation_channels, [String], null: true

    def conversation_channels
      object.conversation_channels.map(&:provider)
    end

    def last_message
      # TODO: we should use last_message_id relation to batch this properly
      object.latest_message
    end

    field :state, String, null: true

    field :messages, Types::PaginatedConversationPartsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 7
    end

    def messages(per:, page:)
      @collection = object.messages
                          .order('id desc')
                          .page(page)
                          .per(per)
    end
  end
end
