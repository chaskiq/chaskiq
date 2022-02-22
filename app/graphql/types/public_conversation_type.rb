# frozen_string_literal: true

module Types
  class PublicConversationType < Types::ConversationType
    def last_message
      # TODO: we should use last_message_id relation to batch this properly
      object.public_latest_message
    end

    field :messages, Types::PaginatedConversationPartsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 7
    end

    def messages(per:, page:)
      @collection = object.messages
                          .visibles
                          .order("id desc")
                          .page(page)
                          .per(per)
    end
  end
end
