# frozen_string_literal: true

require "json"

namespace :graphql do
  namespace :dump do
    desc "Dumps the IDL schema into ./app/hermes/schema.graphql"
    task idl: [:environment] do
      target = Rails.root.join("public/schema.graphql")
      schema = GraphQL::Schema::Printer.print_schema(ChaskiqSchema)
      File.write(target, schema)
      puts "Schema dumped into public/schema.graphql"
    end

    desc "Dumps the result of the introspection query into ./app/hermes/schema.json"
    task json: [:environment] do
      target = Rails.root.join("public/schema.json")
      result = ChaskiqSchema.execute(GraphQL::Introspection::INTROSPECTION_QUERY)
      File.write(target, JSON.pretty_generate(result))
      puts "Schema dumped into public/schema.json"
    end
  end

  desc "Dumps both the IDL and result of introspection query in app/graph"
  task dump: ["graphql:dump:idl", "graphql:dump:json"]
end
