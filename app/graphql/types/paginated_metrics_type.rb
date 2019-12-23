# frozen_string_literal: true

module Types
  class PaginatedMetricsType < Types::PaginatedResultsType
    collection_type(Types::MetricType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
