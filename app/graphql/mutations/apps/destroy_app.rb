module Mutations
  class Apps::DestroyApp < GraphQL::Schema::RelayClassicMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true
    
    argument :app_key, String, required: true

    def resolve(app_key:)
      @app = context[:current_user].apps.find_by(key: app_key)
      @app.destroy
      { app: @app, errors: @app.errors }
    end
  end
end
