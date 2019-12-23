# frozen_string_literal: true

module Mutations
  module Bots
    class CreateBotTask < Mutations::BaseMutation
      field :bot_task, Types::BotTaskType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true

      def resolve(app_key:, params:)
        find_app(app_key)
        @bot_task = @app.bot_tasks.create(params.permit(:title, :paths, :type))
        { bot_task: @bot_task, errors: @bot_task.errors }
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
