# frozen_string_literal: true

module Types
  class PaginatedVisitsType < Types::PaginatedResultsType
    collection_type(Types::VisitType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
