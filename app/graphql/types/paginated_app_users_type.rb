# frozen_string_literal: true

module Types
  class PaginatedAppUsersType < Types::PaginatedResultsType
    collection_type(Types::AppUserType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
