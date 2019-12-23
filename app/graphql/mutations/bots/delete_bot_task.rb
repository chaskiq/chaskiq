# frozen_string_literal: true

module Mutations
  module Bots
    class DeleteBotTask < Mutations::BaseMutation
      field :bot_task, Types::BotTaskType, null: false
      field :errors, Types::JsonType, null: true
      argument :id, Integer, required: true
      argument :app_key, String, required: true

      def resolve(app_key:, id:)
        find_app(app_key)
        @bot_task = @app.bot_tasks.find(id)
        @bot_task.destroy
        { bot_task: @bot_task, errors: @bot_task.errors }
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
