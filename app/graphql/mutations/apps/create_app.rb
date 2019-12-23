# frozen_string_literal: true

module Mutations
  class Apps::CreateApp < Mutations::BaseMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_params, Types::JsonType, required: true
    argument :operation, String, required: false

    def resolve(app_params:, operation:)
      if operation.blank? || (operation == 'new')
        @app = current_user.apps.new
      elsif
        @app = current_user.apps.create(app_params.permit!)
      end

      { app: @app, errors: @app.errors }
    end
  end
end
