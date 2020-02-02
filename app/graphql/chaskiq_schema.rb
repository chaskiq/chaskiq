# frozen_string_literal: true

class ChaskiqSchema < GraphQL::Schema
  log_query_depth = GraphQL::Analysis::QueryDepth.new do |_query, depth|
    Rails.logger.info("[GraphQL Query Depth] #{depth}")
  end
  query_analyzer(log_query_depth)

  mutation(Types::MutationType)
  query(Types::QueryType)

  #use GraphQL::Batch
  def self.unauthorized_object(error)
    # Add a top-level error to the response instead of returning nil:
    raise GraphQL::ExecutionError, "An object of type #{error.type.graphql_name} was hidden due to permissions"
  end

  def self.unauthorized_field(error)
    # Add a top-level error to the response instead of returning nil:
    raise GraphQL::ExecutionError, "The field #{error.field.graphql_name} on an object of type #{error.type.graphql_name} was hidden due to permissions"
  end

end
