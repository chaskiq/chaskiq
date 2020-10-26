# frozen_string_literal: true

class AppUserEventJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id:)
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"

    Tour.broadcast_tour_to_user(app_user) ||
      BotTask.broadcast_task_to_user(app_user) ||
      UserAutoMessage.broadcast_message_to_user(app_user)
  end
end
