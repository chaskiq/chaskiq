# frozen_string_literal: true

class ChaskiqSchema < GraphQL::Schema
  log_query_depth = GraphQL::Analysis::QueryDepth.new do |_query, depth|
    Rails.logger.info("[GraphQL Query Depth] #{depth}")
  end
  query_analyzer(log_query_depth)

  mutation(Types::MutationType)
  query(Types::QueryType)
end
