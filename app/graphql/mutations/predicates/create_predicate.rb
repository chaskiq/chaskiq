module Mutations
  class Predicates::CreatePredicate < GraphQL::Schema::RelayClassicMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true
    
    argument :app_params, Types::JsonType, required: true
    argument :operation, String, required: false


    @segment = @app.segments.new(segment_params)


    def resolve(app_params:, operation: )
      current_user = context[:current_user]
      if operation.blank? or operation == "new"
        @app = current_user.apps.new
      elsif 
        @app = current_user.apps.create(app_params.permit!)        
      end

      { app: @app, errors: @app.errors }
    end
  end

end