# frozen_string_literal: true

module Mutations
  module QuickReplies
    class DeleteQuickReply < Mutations::BaseMutation
      field :quick_reply, Types::QuickReplyType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :id, Integer, required: true

      def resolve(app_key:, id:) #, lang:)
        app = App.find_by(key: app_key)

        quick_reply = app.quick_replies.find(id)
        quick_reply.destroy
        
        { 
          quick_reply: quick_reply, 
          errors: quick_reply.errors 
        }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
