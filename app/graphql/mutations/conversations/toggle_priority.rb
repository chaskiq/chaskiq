# frozen_string_literal: true

module Mutations
  module Conversations
    class TogglePriority < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true

      def resolve(app_key:, conversation_id:)
        find_app(app_key)
        @conversation = conversation(conversation_id)
        @conversation.toggle_priority
        track_event
        { conversation: @conversation, errors: @conversation.errors }
      end

      def conversation(conversation_id)
        conversation = @app.conversations.find(conversation_id)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end

      def track_event
        @conversation.log_async(
          action: "prioritize",
          user: current_user,
          data: { value: @conversation.priority },
          ip: context[:request].remote_ip
        )
      end
    end
  end
end
