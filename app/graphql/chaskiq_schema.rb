class ChaskiqSchema < GraphQL::Schema
  log_query_depth = GraphQL::Analysis::QueryDepth.new { |query, depth| 
    Rails.logger.info("[GraphQL Query Depth] #{depth}")
  }
  query_analyzer(log_query_depth)

  mutation(Types::MutationType)
  query(Types::QueryType)
end
