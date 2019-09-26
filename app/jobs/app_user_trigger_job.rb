class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send the first trigger step
  def perform(app_key:, user_id:, trigger_id:, conversation: )
    @app = App.find_by(key: app_key)
    conversation = @app.conversations.find_by(key: conversation)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"
    trigger = @app.bot_tasks.find(trigger_id) rescue find_factory_template(trigger_id, app_user)

    #MessengerEventsChannel.broadcast_to(key, {
    #  type: "triggers:receive", 
    #  data: {
    #    trigger: trigger, 
    #    step: trigger.paths.first[:steps].first 
    #  }
    #}.as_json) if trigger.paths.first[:steps]

    # TODO: use bot
    author = @app.agents.first
    step = trigger.paths.first[:steps].first
    message = step[:messages].first
    @message = conversation.add_message({
      step_id: step[:step_uid],
      trigger_id: trigger.id,
      from: author,
      message: {
        html_content: message[:html_content],
        serialized_content: message[:serialized_content],
        text_content: message[:html_content]
      }
    })
    

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
