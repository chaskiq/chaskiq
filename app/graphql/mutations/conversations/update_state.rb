# frozen_string_literal: true

module Mutations
  module Conversations
    class UpdateState < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true
      argument :state, String, required: true

      def resolve(app_key:, conversation_id:, state:)
        find_app(app_key)

        @conversation = conversation(conversation_id)

        if %w[reopen close].include?(state)
          @conversation.send(state.to_sym)
          @conversation.save
        end

        { conversation: @conversation, errors: @conversation.errors }
      end

      def conversation(conversation_id)
        conversation = @app.conversations.find(conversation_id)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
