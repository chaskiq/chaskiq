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

    process_next_step(message) if message.from_bot?
  end

  def process_next_step(message)

    trigger, path = ActionTriggerFactory.find_task(
      data: {
        "step"=> message.step_id, 
        "trigger"=> message.trigger_id
      }, 
      app: @app,
      app_user: @app_user 
    )

    next_index = path["steps"].index{|o| 
      o["step_uid"].to_s == message.step_id
    } + 1

    next_step = path["steps"][next_index]

    return if next_step.blank?

    author = @app.agents.first

    m = next_step["messages"].first
    
    if m.present?
      @message = message.conversation.add_message({
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        message: {
          html_content: m[:html_content],
          serialized_content: m[:serialized_content],
          text_content: m[:html_content]
        }
      })
    end

    if next_step["controls"].present?
      @message = message.conversation.add_message({
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step["controls"]
      })
    end

    if message["submit"].present?
      data_submit(message["submit"])
    end

  end

  def data_submit(data)
    # TODO: check permitted params here!
    data.delete('action')
    @app_user.update(data)
  end

  def trigger_step(data)
    @conversation = @app.conversations.find_by(key: data["conversation_id"])
    message = @conversation.messages.find(data["message_id"])

    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app, app_user: @app_user)
    
    next_step = path["steps"].find{|o| o["step_uid"] == data["step"]}
 
    author = @app.agents.first

    m = next_step["messages"].first

    if m.present?
      @conversation.add_message({
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        message: {
          html_content: m[:html_content],
          serialized_content: m[:serialized_content],
          text_content: m[:html_content]
        }
      })
    end

    if next_step["controls"].present?
      @conversation.add_message({
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step["controls"]
      })
    end
    
  end

=begin
  def received_trigger_step(data)

    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app,app_user: @app_user )

    next_index = path["steps"].index{|o| o["step_uid"] == data["step"]} + 1
    next_step = path["steps"][next_index]
 
    key = "#{@app.key}-#{@app_user.session_id}"

    if data["submit"].present?
      data_submit(data["submit"])
    end

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
=end

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
        conversation: data["conversation"],
        trigger_id: data["trigger"]
      }
    )
  end
end
