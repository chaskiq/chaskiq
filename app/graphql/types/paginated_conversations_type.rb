# frozen_string_literal: true

module Types
  class PaginatedConversationsType < Types::PaginatedResultsType
    collection_type(Types::ConversationType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
