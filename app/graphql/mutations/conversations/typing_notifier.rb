# frozen_string_literal: true

module Mutations
  module Conversations
    class TypingNotifier < Mutations::BaseMutation
      field :message, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:)
        app = App.find_by(key: app_key)

        conversation = app.conversations.find_by(key: id)

        key = "#{app.key}-#{conversation.main_participant.session_id}"

        if current_user.is_a?(Agent)
          author = app.agents.where('agents.email =?', current_user.email).first
          MessengerEventsChannel.broadcast_to(key, {
            type: 'conversations:typing',
            data: {
              conversation: conversation.key,
              author: {
                name: author.name
              }
            }
          }.as_json)
        else
          # TODO: check this, when permit multiple emails, check by different id
          author = app.app_users.where(['email =?', current_user.email]).first
          EventsChannel.broadcast_to(key, {
            type: 'conversations:typing',
            data: {
              conversation: conversation.key,
              author: {
                name: author.name
              }
            }
          }.as_json)
        end

        { message: 'ok' }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
