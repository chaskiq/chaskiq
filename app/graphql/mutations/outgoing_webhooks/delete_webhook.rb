module Mutations
  class OutgoingWebhooks::DeleteWebhook < Mutations::BaseMutation
    field :webhook, Types::JsonType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_key, String, required: false
    argument :id, String, required: true

    def resolve(app_key:, id:)
      current_user = context[:current_user]
      @app = current_user.apps.find_by(key: app_key)
      @webhook = @app.outgoing_webhooks.find(id)

      authorize! @webhook, to: :can_manage_outgoing_webhooks?, with: AppPolicy, context: {
        app: @app
      }
      @webhook.delete
      { webhook: @webhook, errors: @webhook.errors }
    end
  end
end
