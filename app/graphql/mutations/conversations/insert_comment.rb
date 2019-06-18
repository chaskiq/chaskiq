
module Mutations
  module Conversations
    class InsertComment < Mutations::BaseMutation
      # GraphQL::Schema::RelayClassicMutation
      # TODO: define return fields
      field :message, Types::ConversationPartType, null: false
      #field :oli, String, null: false
      # TODO: define arguments
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :message, String, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)
        app = App.find_by(key: app_key)


        conversation = app.conversations.find(id)
        
        if current_user.is_a?(Agent)
          author = app.agents.where("agents.email =?", current_user.email).first
        else
          # TODO: check this, when permit multiple emails, check by different id
          author = app.app_users.joins(:user).where(["users.email =?", current_user.email ]).first 
        end

        @message = conversation.add_message({
          from: author,
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


