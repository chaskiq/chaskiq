# frozen_string_literal: true

module Mutations
  class Apps::CreateApp < Mutations::BaseMutation
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_params, Types::JsonType, required: true
    argument :operation, String, required: false

    def resolve(app_params:, operation:)
      authorize! current_user, to: :create_app?, with: AppPolicy

      if operation.blank? || (operation == "new")
        @app = current_user.apps.new
      elsif @app = current_user.apps.create(app_params.permit!)
        
        if @app.errors.any?
          return { app: @app, errors: @app.errors }
        end
        
        @app.owner = current_user
        @app.save
      end

      { app: @app, errors: @app.errors }
    end
  end
end
