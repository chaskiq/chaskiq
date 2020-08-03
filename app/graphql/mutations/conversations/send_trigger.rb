# frozen_string_literal: true

module Mutations
  module Conversations
    class SendTrigger < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true
      argument :trigger_id, Integer, required: true

      def resolve(app_key:, conversation_id:, trigger_id:)
        find_app(app_key)
        @conversation = conversation(conversation_id)
        user = @conversation.main_participant
        key = "#{@app.key}-#{user.session_id}"
        bot_task = @app.bot_tasks.find(trigger_id)

        # TODO: move this method to conversation model?
        MessengerEventsChannel.broadcast_to(key, {
          type: 'triggers:receive',
          data: {
            trigger: bot_task,
            step: bot_task.paths.first['steps'].first
          }
        }.as_json)
  
        user.metrics.create(
          trackable: bot_task,
          action: 'bot_tasks.delivered'
        )

        { 
          conversation: @conversation, 
          errors: @conversation.errors 
        }
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
