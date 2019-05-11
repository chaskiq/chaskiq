module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    # TODO: remove me
    field :test_field, String, null: false,
      description: "An example field added by the generator"
    def test_field
      "Hello World!"
    end


    field :app, Types::AppType, null: false, description: "get app" do
      argument :key, String, required: true
    end

    def app(key:)
      @app = current_user.apps.find_by(key: key)
    end
  end
end
