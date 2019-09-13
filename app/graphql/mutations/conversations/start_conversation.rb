
module Mutations
  module Conversations
    class StartConversation < Mutations::BaseMutation
      
      field :conversation, Types::ConversationType, null: false
      argument :app_key, String, required: true
      argument :id, Int, required: false, default_value: nil
      argument :message, Types::JsonType, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, message:)

        if current_user.is_a?(Agent)
          app = current_user.apps.find_by(key: app_key)
          author = app.agents.where("agents.email =?", current_user.email).first
          participant = app.app_users.find(id)
        elsif app_user = context[:get_app_user].call
          app = App.find_by(key: app_key)
          # TODO: check this, when permit multiple emails, check by different id
          author = app_user #app.app_users.where(["email =?", current_user.email ]).first 
          participant = nil
        end

        options = {
          from: author,
          participant: participant,
          message: {
            html_content: message["html"],
            serialized_content: message["serialized"],
            text_content: message["serialized"]
          }
        }

        if message["volatile"].present?
          trigger_id = message["volatile"]["trigger"]["id"]
          step = message["volatile"]["currentStep"]["step_uid"]
          data = {
            "trigger"=> trigger_id, 
            "step"=> step
          }
          
          trigger, path = ActionTriggerFactory.find_task(data: data, app: app, app_user: app_user)

          next_index = path["steps"].index{|o| o["step_uid"] == data["step"]} + 1
          next_step = path["steps"][next_index]

          if path["follow_actions"].present?
            assignee = path["follow_actions"].find{|o| o["name"] == "assign"}
            options.merge!({assignee: app.agents.find(assignee["value"])}) if assignee.present?
          end
        end
        
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