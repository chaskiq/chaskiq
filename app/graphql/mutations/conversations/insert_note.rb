# frozen_string_literal: true

module Mutations
  module Conversations
    class InsertNote < Mutations::BaseMutation
      field :message, Types::ConversationPartType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :message, Types::MessageInputType, required: true

      def resolve(app_key:, id:, message:)
        message = message.to_h.with_indifferent_access
        app = App.find_by(key: app_key)
        conversation = app.conversations.find(id)

        authorize! conversation, to: :can_manage_conversations?, with: AppPolicy, context: {
          app: @app
        }

        author = if current_user.is_a?(Agent)
                   app.agents.where("agents.email =?", current_user.email).first
                 else
                   # TODO: check this, when permit multiple emails, check by different id
                   app.app_users.where(["email =?", current_user.email]).first
                 end

        sanitized_html = ActionController::Base.helpers.strip_tags(message[:html])
        @message = conversation.add_private_note(
          from: author,
          message: {
            html_content: sanitized_html,
            serialized_content: message[:serialized],
            text_content: message[:text] || sanitized_html
          }
        )
        { message: @message }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
