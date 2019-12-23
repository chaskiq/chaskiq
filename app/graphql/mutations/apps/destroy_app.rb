# frozen_string_literal: true

module Mutations
  class Apps::DestroyApp < Mutations::BaseMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_key, String, required: true

    def resolve(app_key:)
      @app = current_user.apps.find_by(key: app_key)
      @app.destroy
      { app: @app, errors: @app.errors }
    end
  end
end
