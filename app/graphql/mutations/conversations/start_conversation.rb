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
            text_content: message['text'] || ActionController::Base.helpers.strip_tags(message['html'])
          }
        }

        # in reply block will create convo without append message
        if message["reply"].present?
          options = {
            from: author,
            participant: participant
          }
        end

        # creates conversation
        conversation = app.start_conversation(options)

        # in reply mode we create separated message
        # meybe we could refactor this an put this into app.start_conversation method
        if message["reply"].present?
          trigger = app.bot_tasks.find(message["trigger"])
          message_reply = message["reply"]
          first_step = trigger.paths[0]["steps"][0] 
          step_uid = first_step["step_uid"]

          message = conversation.add_message(
            step_id: step_uid,
            trigger_id: trigger.id,
            from: app.agent_bots.first,
            controls: first_step["controls"]
          )

          data = message_reply.permit(
            :id, :label, :element, :next_step_uuid
          ).to_h

          message.message.save_replied(data)

          # initialize message

          attributes = {
            conversation_key: conversation.key,
            message_key: message.key,
            trigger: message.trigger_id,
            step: message.messageable.data["next_step_uuid"],
            reply: message.messageable.data
          }.with_indifferent_access

          ActionTrigger.trigger_step(
            attributes,
            app, 
            app_user
          )
        end

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
