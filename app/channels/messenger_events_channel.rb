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

    if message.from_bot?
      process_next_step(message)

      if data["submit"].present?
        opts = [:email, :name, :first_name, :last_name, :etc]
        @app_user.update(data.slice(opts)) # some condition from settings here?
        data_submit(data["submit"], message)
      end

      if data["reply"].present?
        data_submit(data["reply"], message)
      end
    end
  end

  def app_package_submit(data)
    @conversation = @app.conversations.find_by(key: data["conversation_id"])
    message = @conversation.messages.find(data["message_id"])
    data_submit(data["submit"], message)
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

    author = @app.agent_bots.first

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

  end

  def data_submit(data, message)
    message.message.save_replied(data) if message.message.respond_to?(:save_replied)
  end

  def trigger_step(data)
    @conversation = @app.conversations.find_by(key: data["conversation_id"])
    message = @conversation.messages.find(data["message_id"])

    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app, app_user: @app_user)
    
    next_step = path["steps"].find{|o| o["step_uid"] == data["step"]}
 
    author = @app.agent_bots.first

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

    if message.from_bot?
      if data["reply"].present?
        data_submit(data["reply"], message)
      end
    end
    
  end

  def request_trigger(data)

    #AppUserTriggerJob
    #.set(wait_until: @app_user.delay_for_trigger)
    #.perform_later({

    AppUserTriggerJob
    .set(wait_until: @app_user.delay_for_trigger)
    .perform_later({
        app_key: @app.key, 
        user_id: @app_user.id, 
        conversation: data["conversation"],
        trigger_id: data["trigger"]
      }
    )
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

end
