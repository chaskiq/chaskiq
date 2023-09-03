# frozen_string_literal: true

module Types
  class PaginatedCampaignType < Types::PaginatedResultsType
    collection_type(Types::CampaignType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
