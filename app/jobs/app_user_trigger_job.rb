class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id: )
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"
    trigger = ActionTriggerFactory.request_for_email(app: @app)
    
    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: {trigger: trigger, step: trigger.paths.first[:steps].first }
    }.as_json)
  end

end
