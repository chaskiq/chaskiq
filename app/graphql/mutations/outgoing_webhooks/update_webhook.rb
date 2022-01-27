module Mutations
  class OutgoingWebhooks::UpdateWebhook < Mutations::BaseMutation
    field :webhook, Types::JsonType, null: false
    field :errors, Types::JsonType, null: true

    argument :app_key, String, required: false

    argument :url, String, required: true
    argument :id, Integer, required: true
    argument :state, String, required: true
    argument :tags, Types::JsonType, required: false

    def resolve(app_key:, url:, tags:, id:, state:)
      current_user = context[:current_user]
      @app = current_user.apps.find_by(key: app_key)
      @webhook = @app.outgoing_webhooks.find(id)

      authorize! @webhook, to: :can_manage_outgoing_webhooks?, with: AppPolicy, context: {
        app: @app
      }

      state_value = if ActiveModel::Type::Boolean.new.cast(state)
                      "enabled"
                    else
                      "disabled"
                    end

      @webhook.update(
        url: url,
        tag_list: tags,
        state: state_value
      )

      { webhook: @webhook, errors: @webhook.errors }
    end
  end
end
