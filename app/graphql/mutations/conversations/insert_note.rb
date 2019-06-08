
module Mutations
  module Conversations
    class InsertNote < GraphQL::Schema::Mutation
      
      field :message, Types::ConversationPartType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :message, String, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)
        app = App.find_by(key: app_key)

        conversation = app.conversations.find(id)
        app_user = app.app_users.joins(:user).where(["users.email =?", current_user.email ]).first 

        @message = conversation.add_private_note({
          from: app_user,
          message: message
        })
        {message: @message}
      end


      def current_user
        context[:current_user]
      end
    end
  end
end