module Mutations
  module Conversations
    class UpdateState < GraphQL::Schema::Mutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true
      
      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true
      argument :state, String, required: true

      def resolve(app_key: , conversation_id:, state:)
        find_app(app_key)
        
        @conversation = conversation(conversation_id)

        if ["reopen", "close"].include?(state)
          @conversation.send(state.to_sym)
          @conversation.save
        end
        
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