require "execjs"
require 'rspec/expectations'

module GraphQL

  class TestClient

    def self.configure(files=[
      Rails.root + "app/javascript/src/graphql/queries.js",
      Rails.root + "app/javascript/src/graphql/mutations.js"
      ])
      #queries = Rails.root + "app/javascript/src/graphql/queries.js"
      #mutations = Rails.root + "app/javascript/src/graphql/mutations.js"
      #source1 = clean_file(queries)
      #source2 = cleanYb4Y`^*Q_file(mutations)

      @strings = files.map{|o| clean_file(o)}.join("\n")

      #[source1, source2].join("\n")
    end

    def self.reset_strings
      @strings = nil
      @context = nil
    end

    def self.context
      @context ||= ExecJS.compile(@strings || configure)
    end

    def self.clean_file(path)
      open(path).read.gsub("\n", "")
                         .gsub("export const", " ")
                         .gsub("`", "'")
    end

    def self.query(type)
      context.eval(type)
    end
  end

end

def graphql_query(type)
  GraphQL::TestClient.query(type)
end

def graphql_post(type:, variables: {})
  data = {
    query: graphql_query(type),
    variables: variables
  }
  post :execute, body: data.to_json, as: :json, xhr: true
end

#def graphql_errors
#  data = graphql_data
#  data[data.keys.first]["errors"]
#end

def graphql_error?
  data = graphql_data
  data[data.keys.first].keys.include?("errors")
end

def graphql_response
  JSON.parse(response.body, object_class: OpenStruct)
end

def graphql_data
  JSON.parse(response.body)["data"]
end

def graphql_errors
  JSON.parse(response.body)["errors"].first rescue nil
end

module GraphqlMatchers
  extend RSpec::Matchers::DSL

  matcher :has_graphql_errors do
    data = JSON.parse(response.body)["data"]
    data[data.keys.first]["errors"]
  end

end
