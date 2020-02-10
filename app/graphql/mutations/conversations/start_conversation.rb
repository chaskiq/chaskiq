# frozen_string_literal: true

module Mutations
  module Conversations
    class StartConversation < Mutations::BaseMutation
      field :conversation, Types::ConversationType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: false, default_value: nil
      argument :message, Types::JsonType, required: true

      def resolve(app_key:, id:, message:)
        if current_user.is_a?(Agent)
          app = current_user.apps.find_by(key: app_key)
          author = app.agents.where('agents.email =?', current_user.email).first
          participant = app.app_users.find(id)
        elsif app_user = context[:get_app_user].call
          app = App.find_by(key: app_key)
          # TODO: check this, when permit multiple emails, check by different id
          author = app_user # app.app_users.where(["email =?", current_user.email ]).first
          participant = nil
        end

        options = {
          from: author,
          participant: participant,
          message: {
            html_content: message['html'],
            serialized_content: message['serialized'],
            text_content: message['serialized']
          }
        }

        conversation = app.start_conversation(options)

        {
          conversation: conversation
        }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
