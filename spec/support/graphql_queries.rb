require "execjs"
require "rspec/expectations"


def graphql_query(type)
  GraphQL::TestClient.query(type)
end

def graphql_post(data)
  post :execute, body: data.to_json, as: :json, xhr: true
end

def graphql_raw_post(raw:, variables: {})
  data = {
    query: raw,
    variables: variables
  }
  post :execute, body: data.to_json, as: :json, xhr: true
end

# def graphql_errors
#  data = graphql_data
#  data[data.keys.first]["errors"]
# end

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
  JSON.parse(response.body)["errors"].first
rescue StandardError
  nil
end

module GraphQL
  class TestClient

    attr_accessor :actions, :entry
    def configure(entry = Rails.root + "app/javascript/packages/store/src/graphql/testEntry.ts")
      @entry = entry
    end

    def get_actions
      configure if @entry.blank?
      actions = `npx ts-node #{@entry}`
      @actions = JSON.parse(actions)
    end

    def data_for(type:, variables: {})
      data = {
        query: @actions[type],
        variables: variables
      }
    end

    def self.query(type)
      configure if @entry.blank?
      `npx ts-node #{@entry} #{type}`
    end
  end
end

module GraphqlMatchers
  extend RSpec::Matchers::DSL

  matcher :has_graphql_errors do
    data = JSON.parse(response.body)["data"]
    data[data.keys.first]["errors"]
  end
end
