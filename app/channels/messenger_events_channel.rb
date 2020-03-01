# frozen_string_literal: true

class MessengerEventsChannel < ApplicationCable::Channel
  include UserFinder

  def subscribed
    get_session_data

    stream_from "messenger_events:#{@app.key}-#{@app_user.session_id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def send_message(options)
    get_session_data
    options.delete('action')

    VisitCollector.new(user: @app_user)
    .update_browser_data(options)

    AppUserEventJob.perform_now(
      app_key: @app.key,
      user_id: @app_user.id
    )
  end

  def receive_conversation_part(data)
    get_session_data
    @conversation = @app.conversations.find_by(key: data['conversation_id'])
    message = @conversation.messages.find(data['message_id'])
    message.read! if message.authorable != @app_user

    if message.from_bot?
      process_next_step(message)

      if data['submit'].present?
        opts = %w[email name first_name last_name phone company_name company_size etc]
        @app_user.update(data['submit'].slice(*opts)) # some condition from settings here?
        data_submit(data['submit'], message)
      end

      data_submit(data['reply'], message) if data['reply'].present?
    end
  end

  def app_package_submit(data)
    get_session_data
    @conversation = @app.conversations.find_by(key: data['conversation_id'])
    message = @conversation.messages.find(data['message_id'])
    data_submit(data['submit'], message)
  end

  def process_next_step(message)

    return if message.trigger_locked.value.present?

    message.trigger_locked.value = 1

    trigger, path = ActionTriggerFactory.find_task(
      data: {
        'step' => message.step_id,
        'trigger' => message.trigger_id
      },
      app: @app,
      app_user: @app_user
    )

    next_index = path['steps'].index do |o|
      o['step_uid'].to_s == message.step_id
    end + 1

    next_step = path['steps'][next_index]

    if next_step.blank?
      handle_follow_actions(path)
      return
    end

    author = @app.agent_bots.first

    m = next_step['messages'].first

    if m.present?
      @message = message.conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        message: {
          html_content: m[:html_content],
          serialized_content: m[:serialized_content],
          text_content: m[:html_content]
        }
      )
    end

    if next_step['controls'].present?
      @message = message.conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step['controls']
      )
    end
  end

  def handle_follow_actions(path)
    get_session_data
    follow_actions = path['follow_actions']
    return if follow_actions.blank?

    follow_actions.each do |action|
      process_follow_action(action)
    end
  end

  def process_follow_action(action)
    get_session_data
    case action['key']
    when 'assign'
      # assign_user
      agent = @app.agents.find(action['value'])
      return if agent.blank?

      @conversation.assign_user(agent)
    when 'close'
      @conversation.close
    end
  end

  def data_submit(data, message)
    get_session_data
    if message.message.respond_to?(:save_replied)
      message.message.save_replied(data)
    end
  end

  def trigger_step(data)
    get_session_data
    
    @conversation = @app.conversations.find_by(key: data['conversation_id'])
    
    message = @conversation.messages.find(data['message_id'])

    trigger, path = ActionTriggerFactory.find_task(data: data, app: @app, app_user: @app_user)

    next_step = path['steps'].find { |o| o['step_uid'] == data['step'] }

    author = @app.agent_bots.first

    m = next_step['messages'].first

    if m.present?
      @conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        message: {
          html_content: m[:html_content],
          serialized_content: m[:serialized_content],
          text_content: m[:html_content]
        }
      )
    end

    if next_step['controls'].present?
      @conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step['controls']
      )
    end

    if message.from_bot?
      if data['reply'].present?
        data_submit(data['reply'], message) 

        trigger.register_metric(
          @app_user, 
          data: data['reply'], 
          options: {
            message_key: message.key,
            conversation_key: @conversation.key
          }
        ) if trigger.respond_to?(:register_metric)
        
      end
    end
  end

  def request_trigger(data)
    get_session_data
    # AppUserTriggerJob
    # .set(wait_until: @app_user.delay_for_trigger)
    # .perform_later({

    AppUserTriggerJob
      .perform_now(
        app_key: @app.key,
        user_id: @app_user.id,
        conversation: data['conversation'],
        trigger_id: data['trigger']
      )
  end

  def track_open(data)
    get_session_data

    @app_user.track_open(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_close(data)
    get_session_data

    @app_user.track_close(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_click(data)
    get_session_data
    @app_user.track_click(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_tour_finished(data)
    get_session_data
    @app_user.track_finish(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_tour_skipped(data)
    get_session_data
    @app_user.track_skip(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  private

  def get_session_data
    
    @app = App.find_by(key: params[:app])

    OriginValidator.new(
      app: @app.domain_url, 
      host: connection.env['HTTP_ORIGIN']
    ).is_valid?

    get_user_data
    find_user
  end

end
