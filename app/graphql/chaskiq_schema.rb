# frozen_string_literal: true

class ChaskiqSchema < GraphQL::Schema
  class ChaskiqComplexityAnalyzer < GraphQL::Analysis::AST::QueryComplexity
    def result
      Rails.logger.info("[GraphQL Query Complexity] #{max_possible_complexity} | user: #{query.context[:current_user]&.id}")
    end
  end

  disable_introspection_entry_points unless Chaskiq::Config.get("ENABLE_GRAPHQL_INSTROSPECTION") # if Rails.env.production?

  query_analyzer(ChaskiqComplexityAnalyzer)

  mutation(Types::MutationType)
  query(Types::QueryType)

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
