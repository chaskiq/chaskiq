
module Mutations
  module Conversations
    class StartConversation < Mutations::BaseMutation
      
      field :conversation, Types::ConversationType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :message, Types::JsonType, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)

        app = current_user.apps.find_by(key: app_key)
        
        app_user = app.app_users.find(id)

        if current_user.is_a?(Agent)
          author = app.agents.where("agents.email =?", current_user.email).first
        else
          # TODO: check this, when permit multiple emails, check by different id
          author = app.app_users.where(["email =?", current_user.email ]).first 
        end

        conversation = app.start_conversation({
          from: author,
          participant: app_user,
          message: {
            html_content: message["html"],
            serialized_content: message["serialized"],
            text_content: message["serialized"]
          }
        })
        {conversation: conversation}
      end


      def current_user
        context[:current_user]
      end
    end
  end
end