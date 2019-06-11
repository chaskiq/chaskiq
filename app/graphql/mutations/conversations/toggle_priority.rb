module Mutations
  module Conversations
    class TogglePriority < GraphQL::Schema::Mutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true
      
      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true

      def resolve(app_key: , conversation_id:)
        find_app(app_key)
        @conversation = conversation(conversation_id)
        @conversation.toggle_priority
        { conversation: @conversation , errors: @conversation.errors }
      end

      def conversation(conversation_id)
        conversation = @app.conversations.find(conversation_id)
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end