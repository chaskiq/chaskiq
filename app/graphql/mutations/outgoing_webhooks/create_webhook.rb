# frozen_string_literal: true

module Mutations
  class OutgoingWebhooks::CreateWebhook < Mutations::BaseMutation
    field :webhook, Types::JsonType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_key, String, required: false

    argument :url, String, required: true
    argument :state, String, required: true
    argument :tags, Types::JsonType, required: false

    def resolve(app_key:, url:, tags:, state:)
      current_user = context[:current_user]
      @app = current_user.apps.find_by(key: app_key)

      authorize! @app, to: :can_manage_outgoing_webhooks?, with: AppPolicy, context: {
        app: @app
      }

      state_value = if ActiveModel::Type::Boolean.new.cast(state)
                      "enabled"
                    else
                      "disabled"
                    end

      authorize! @app, to: :manage?, with: AppPolicy

      @webhook = @app.outgoing_webhooks.new
      @webhook.assign_attributes(
        url: url,
        tag_list: tags,
        state: state_value
      )
      @webhook.save

      { webhook: @webhook, errors: @webhook.errors }
    end
  end
end
