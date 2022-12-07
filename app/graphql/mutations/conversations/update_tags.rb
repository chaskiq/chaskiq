# frozen_string_literal: true

module Mutations
  module Conversations
    class UpdateTags < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :conversation_id, String, required: true
      argument :tag_list, [String], required: true

      def resolve(app_key:, conversation_id:, tag_list:)
        find_app(app_key)
        @conversation = conversation(conversation_id)

        authorize! @conversation, to: :can_manage_conversations?, with: AppPolicy, context: {
          app: @app
        }

        @conversation.tag_list = tag_list

        @conversation.save

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
