# frozen_string_literal: true

module Mutations
  module Articles
    class ReorderBotTask < Mutations::BaseMutation
      field :bot_task, Types::BotTaskType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :id_after, String, required: true
      argument :mode, String, required: false, default_value: nil

      def resolve(app_key:, id:, id_after:, mode:)
        app = current_user.apps.find_by(key: app_key)

        collection = app.bot_tasks.for_new_conversations if mode == 'new_conversations'
        collection = app.bot_tasks.for_outbound if mode == 'outbound'

        bot_task = collection.find(id)
        position = collection.find(id_after).position

        bot_task.insert_at(position)

        { bot_task: bot_task }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
