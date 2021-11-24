# frozen_string_literal: true

module Mutations
  module Conversations
    class InsertAppBlockComment < Mutations::BaseMutation
      field :message, Types::ConversationPartType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :controls, Types::JsonType, required: true

      def resolve(app_key:, id:, controls:)
        app = App.find_by(key: app_key)

        conversation = app.conversations.find_by(key: id)

        author = app.agents.where("agents.email =?", current_user.email).first if current_user.is_a?(Agent)

        @message = conversation.add_message(
          from: author,
          controls: controls
        )
        { message: @message }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
