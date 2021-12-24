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

        authorize! @conversation, to: :can_manage_conversations?, with: AppPolicy, context: {
          app: @app
        }

        if %w[reopen close].include?(state)
          @conversation.send(state.to_sym)
          @conversation.save
          track_event(state)
        end

        { conversation: @conversation, errors: @conversation.errors }
      end

      def conversation(conversation_id)
        conversation = @app.conversations.find(conversation_id)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end

      def track_event(action)
        @conversation.log_async(
          action: action,
          user: current_user,
          ip: context[:request].remote_ip
        )
      end
    end
  end
end
