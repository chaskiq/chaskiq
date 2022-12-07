# frozen_string_literal: true

module Types
  class PaginatedTeamsType < Types::PaginatedResultsType
    collection_type(Types::TeamType)
  end
end
