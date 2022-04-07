# frozen_string_literal: true

module Mutations
  class Apps::UpdateApp < Mutations::BaseMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :app, Types::AppType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_key, String, required: true
    argument :app_params, Types::AnyType, required: true

    def resolve(app_key:, app_params:)
      @app = current_user.apps.find_by(key: app_key)

      authorize! @app, to: :can_manage_app?, with: AppPolicy, context: {
        role: @app.roles.find_by(agent_id: current_user.id)
      }

      @app.update(app_params.permit!)
      { app: @app, errors: @app.errors }
    end
  end
end
