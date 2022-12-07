# frozen_string_literal: true

module Types
  class PaginatedAgentTeamsType < Types::PaginatedResultsType
    collection_type(Types::AgentType)
  end
end
