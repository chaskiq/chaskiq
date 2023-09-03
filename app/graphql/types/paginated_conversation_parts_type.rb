# frozen_string_literal: true

module Types
  class PaginatedConversationPartsType < Types::PaginatedResultsType
    collection_type(Types::ConversationPartType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
