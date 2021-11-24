# frozen_string_literal: true

module Mutations
  module Conversations
    class AssignUser < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true
      argument :app_user_id, Integer, required: true

      def resolve(app_key:, conversation_id:, app_user_id:)
        find_app(app_key)
        @conversation = conversation(conversation_id)
        @app_user = @app.agents.find(app_user_id)
        @conversation.assign_user(@app_user)

        track_event(app_user_id) unless @conversation.errors.any?

        { conversation: @conversation, errors: @conversation.errors }
      end

      def conversation(conversation_id)
        conversation = @app.conversations.find(conversation_id)
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end

      def track_event(app_user_id)
        @conversation.log_async(action: "assign_user", user: current_user, data: { assignee: app_user_id })
      end
    end
  end
end
