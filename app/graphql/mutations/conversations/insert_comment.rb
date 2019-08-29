
module Mutations
  module Conversations
    class InsertComment < Mutations::BaseMutation
      # GraphQL::Schema::RelayClassicMutation
      # TODO: define return fields
      field :message, Types::ConversationPartType, null: false
      #field :oli, String, null: false
      # TODO: define arguments
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :message, Types::JsonType, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)
        app = App.find_by(key: app_key)
        
        conversation = app.conversations.find_by(key: id)
        
        if current_user.is_a?(Agent)
          author = app.agents.where("agents.email =?", current_user.email).first
        elsif app_user = context[:get_app_user].call
          author = app_user
          # TODO: check this, when permit multiple emails, check by different id
          # author = app.app_users.where(["email =?", current_user.email ]).first
        end

        @message = conversation.add_message({
          from: author,
          message: {
            html_content: message["html"],
            serialized_content: message["serialized"],
            text_content: message["serialized"]
          }
        })
        {message: @message }
      end


      def current_user
        context[:current_user]
      end
    end
  end
end


