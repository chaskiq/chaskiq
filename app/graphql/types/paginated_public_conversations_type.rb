# frozen_string_literal: true

module Types
  class PaginatedPublicConversationsType < Types::PaginatedResultsType
    collection_type(Types::PublicConversationType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
