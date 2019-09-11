class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id:, trigger_id: )
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"
    trigger = find_factory_template(trigger_id, app_user)

    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: {trigger: trigger, step: trigger.paths.first[:steps].first }
    }.as_json) if trigger.paths.first[:steps]
  end

  def find_factory_template(id, user)

    case id
      when "infer"
        trigger = ActionTriggerFactory.infer_for(app: @app, user: user )
      when "request_for_email"
        trigger = ActionTriggerFactory.request_for_email(app: @app)
        return trigger
      when "route_support"
        trigger = ActionTriggerFactory.route_support(app: @app)
        return trigger
      when "typical_reply_time"
        trigger = ActionTriggerFactory.typical_reply_time(app: @app)
        return trigger
      else
      Error.new("template not found") 
    end
  end

end
