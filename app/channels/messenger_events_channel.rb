class MessengerEventsChannel < ApplicationCable::Channel
  def subscribed
    @app  = App.find_by(key: params[:app])

    get_user_data

    if @user_data[:email].blank?
      @app_user = get_user_by_session 
    else
      @app_user = @app.app_users
                  .where("email =?", @user_data[:email])
                  .first
    end

    stream_from "messenger_events:#{@app.key}-#{@app_user.session_id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def data_submit(data)
    # TODO: check permitted params here!
    data.delete('action')
    @app_user.update(data)
  end

  def send_message(options)
    options.delete("action")
    @app_user.visits.create(options)
    AppUserEventJob.perform_now(app_key: @app.key, user_id: @app_user.id)
  end

  def receive_conversation_part(data)
    @conversation = @app.conversations.find_by(key: data["conversation_id"])
    message = @conversation.messages.find(data["message_id"])
    if message.authorable != @app_user
      message.read!
    end
  end


  def track_open(data)
    @app_user.track_open(campaign_id: data["campaign_id"] )
  end

  def track_close(data)
    @app_user.track_close(campaign_id: data["campaign_id"] )
  end

  def track_click(data)
    @app_user.track_click(campaign_id: data["campaign_id"] )
  end

  def track_tour_finished(data)
    @app_user.track_finish(campaign_id: data["campaign_id"] )
  end

  def track_tour_skipped(data)
    @app_user.track_skip(campaign_id: data["campaign_id"] )
  end

  def request_trigger(data)
    AppUserTriggerJob.perform_now({
        app_key: @app.key, 
        user_id: @app_user.id, 
        trigger_id: data["trigger"]
      }
    )
  end

  def received_trigger_step(data)
    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app,app_user: @app_user )

    next_index = path["steps"].index{|o| o["step_uid"] == data["step"]} + 1
    next_step = path["steps"][next_index]
 
    key = "#{@app.key}-#{@app_user.session_id}"

    # si no tiene 
    # binding.pry if next_step.blank?

    conversation = data["conversation"]

    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: {
        step: next_step, 
        trigger: trigger,
        conversation: conversation
      }
    }.as_json) if next_step.present?
    
  end

  def trigger_step(data)
    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app, app_user: @app_user)
  
    next_step = path["steps"].find{|o| o["step_uid"] == data["step"]}
 
    key = "#{@app.key}-#{@app_user.session_id}"
    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: {step: next_step, trigger: trigger }
    }.as_json) if next_step.present?
    
  end

=begin
  def find_factory_template(data)
    data["trigger"]

    case data["trigger"]
      when "infer"
        trigger = ActionTriggerFactory.infer_for(app: @app, user: @app_user )
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

  def find_task(data)
    trigger = @app.bot_tasks.find(data["trigger"]) rescue find_factory_template(data)
    path = trigger.paths.find{|o| 
        o.with_indifferent_access["steps"].find{|a| 
          a["step_uid"] === data["step"] 
      }.present? 
    }.with_indifferent_access
    
    return trigger, path
  end
=end

end
