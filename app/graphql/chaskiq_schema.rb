# frozen_string_literal: true

class ChaskiqSchema < GraphQL::Schema
  log_query_depth = GraphQL::Analysis::QueryDepth.new do |_query, depth|
    Rails.logger.info("[GraphQL Query Depth] #{depth}")
  end
  query_analyzer(log_query_depth)

  mutation(Types::MutationType)
  query(Types::QueryType)

  use BatchLoader::GraphQL

  #use GraphQL::Batch
  def self.unauthorized_object(error)
    # Add a top-level error to the response instead of returning nil:
    raise GraphQL::ExecutionError, "An object of type #{error.type.graphql_name} was hidden due to permissions"
  end

  def self.unauthorized_field(error)
    # Add a top-level error to the response instead of returning nil:
    raise GraphQL::ExecutionError, "The field #{error.field.graphql_name} on an object of type #{error.type.graphql_name} was hidden due to permissions"
  end

  rescue_from(ActionPolicy::Unauthorized) do |exp|
    raise GraphQL::ExecutionError.new(
      # use result.message (backed by i18n) as an error message
      exp.result.message,
      # use GraphQL error extensions to provide more context
      extensions: {
        code: :unauthorized,
        fullMessages: exp.result.reasons.full_messages,
        details: exp.result.reasons.details
      }
    )
  end

end
