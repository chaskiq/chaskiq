# frozen_string_literal: true

module Mutations
  module Conversations
    class InsertComment < Mutations::BaseMutation
      field :message, Types::ConversationPartType, null: true
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :message, Types::MessageInputType, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)
        message = message.to_h.with_indifferent_access
        app = App.find_by(key: app_key)

        conversation = app.conversations.find_by(key: id)

        if current_user.is_a?(Agent)
          author = app.agents.where("agents.email =?", current_user.email).first
          authorize! conversation, to: :can_manage_conversations?, with: AppPolicy, context: {
            app:
          }
        elsif app_user = context[:get_app_user].call
          author = app_user
        end

        options = {
          from: author,
          message: {
            html_content: message[:html],
            serialized_content: message[:serialized],
            text_content: message[:text] || ActionController::Base.helpers.strip_tags(message[:html])
          }
        }

        @message = conversation.add_message(options)
        { message: @message }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
