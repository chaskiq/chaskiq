# frozen_string_literal: true

module Mutations
  module Messenger
    class CreateComment < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, Integer, required: true
      argument :app_user_id, Integer, required: true

      def resolve(conversation_id:)
        @user = context[:get_app_user].call

        @conversation = conversation(conversation_id)
        @app_user = @app.agents.find(app_user_id)
        @conversation.assign_user(@app_user)
        { conversation: @conversation, errors: @conversation.errors }
      end

      def update
        @user = get_app_user
        @conversation = user_conversations.find(params[:id])

        @message = @conversation.add_message(
          from: @user,
          message: {
            html_content: params[:message][:html_content],
            serialized_content: params[:message][:serialized_content]
          },
          check_assignment_rules: params[:check_assignment_rules]
        )
        render :show
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
