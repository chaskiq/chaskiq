# frozen_string_literal: true

class MessengerEventsChannel < ApplicationCable::Channel
  include UserFinder

  def subscribed
    if current_user.blank? || self.app.blank?   
      reject 
      return
    end 
    stream_from "messenger_events:#{self.app.key}-#{self.current_user.session_id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def send_message(options)
    options.delete('action')

    VisitCollector.new(user: current_user)
                  .update_browser_data(options)

    AppUserEventJob.perform_now(
      app_key: app.key,
      user_id: current_user.id
    )
  end

  #### experimental
  def get_banners_for_user()
    Banner.broadcast_banner_to_user(current_user)
  end

  def get_tours_for_user()
    Tour.broadcast_tour_to_user(current_user)
  end

  def get_tasks_for_user()
    BotTask.broadcast_task_to_user(current_user)
  end

  def get_messages_for_user()
    UserAutoMessage.broadcast_message_to_user(current_user)
  end
  #####

  def rtc_events(data)
    @conversation = app.conversations.find_by(key: data['conversation_id'])
    key = "messenger_events:#{app.key}-#{current_user.session_id}"
    key2 = "events:#{app.key}"
    if data['event_type'] == 'JOIN_ROOM'
      ActionCable.server.broadcast key, {
        type: 'rtc_events',
        app: app.key,
        event_type: 'READY',
        conversation_id: @conversation.key
      }
    end
    ActionCable.server.broadcast key2, data
  end

  def receive_conversation_part(data)
    @conversation = app.conversations.find_by(key: data['conversation_key'])
    message = @conversation.messages.find_by(key: data['message_key'])

    # if the message was read skip processing
    # this will avoid message duplication
    return if message.read?

    message.read! if message.authorable != current_user

    if message.from_bot?
      process_next_step(message)

      #### TODO: to be deprecated in favor of app packages
      if data['submit'].present? && message.message&.blocks&.dig('type') == 'data_retrieval'
        opts = app.searcheable_fields_list
        current_user.update(data['submit'].slice(*opts)) # some condition from settings here?
        data_submit(data['submit'], message)
      end
      ####

      data_submit(data['reply'], message) if data['reply'].present?
    end
  end

  # from iframes
  def app_package_submit(data)
    @conversation = app.conversations.find_by(key: data['conversation_key'])
    message = @conversation.messages.find_by(key: data['message_key'])

    app_package = app.app_package_integrations
                      .joins(:app_package)
                      .find_by(
                        "app_packages.name": data['data']['type'].capitalize
                      )

    response = app_package&.call_hook(
      kind: 'submit',
      ctx: {
        lang: I18n.locale,
        app: app,
        location: 'messenger',
        current_user: current_user,
        values: data['data']
      }
    )

    # UPDATE message blocks here!
    new_blocks = message.message.blocks.merge(
      { 'schema' => response[:definitions] }
    )
    m = message.message

    m.blocks = new_blocks
    m.save_replied(data['submit'])

    process_next_step(message)
  end

  def process_next_step(message)
    return if message.trigger_locked.value.present?

    message.trigger_locked.value = 1

    trigger, path = ActionTriggerFactory.find_task(
      data: {
        'step' => message.step_id,
        'trigger' => message.trigger_id
      },
      app: app,
      app_user: current_user
    )

    # for factory triggers this is needed, as they are dynamic
    if !path
      paths = trigger.paths.map do |o|
        o[:steps].find do |s|
          s[:step_uid].to_s == message&.message&.blocks&.dig('next_step_uuid')
        end
      end
      next_step = paths.find { |o| o }.with_indifferent_access
    else
      # normal flow , get next step from next index on the static trigger
      next_index = path['steps'].index do |o|
        o['step_uid'].to_s == message.step_id
      end + 1
      next_step = path['steps'][next_index]
    end

    if next_step.blank?
      handle_follow_actions(path)
      return
    end

    author = app.agent_bots.first

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
    follow_actions = path['follow_actions']
    return if follow_actions.blank?

    follow_actions.each do |action|
      process_follow_action(action)
    end
  end

  def process_follow_action(action)
    case action['key']
    when 'assign'
      # assign_user
      agent = app.agents.find(action['value'])
      return if agent.blank?

      @conversation.assign_user(agent)
    when 'close'
      @conversation.close
    end
  end

  def data_submit(data, message)
    message.message.save_replied(data) if message.message.respond_to?(:save_replied)
  end

  def trigger_step(data)
    conversation = app.conversations.find_by(key: data['conversation_key'])

    message = conversation.messages.find_by(key: data['message_key'])

    trigger, path = ActionTriggerFactory.find_task(data: data, app: app, app_user: current_user)

    next_step = path['steps'].find { |o| o['step_uid'] == data['step'] }

    author = app.agent_bots.first

    m = next_step['messages'].first

    if m.present?
      conversation.add_message(
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

    if message.from_bot?
      if data['reply'].present?
        data_submit(data['reply'], message)
        if trigger.respond_to?(:register_metric)
          trigger.register_metric(
            current_user,
            data: data['reply'],
            options: {
              message_key: message.key,
              conversation_key: conversation.key
            }
          )
        end
      end
    end

    if next_step['controls'].present?
      conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step['controls']
      )
    end
  end

  def request_trigger(data)
    # AppUserTriggerJob
    # .set(wait_until: current_user.delay_for_trigger)
    # .perform_later({

    AppUserTriggerJob
      .perform_now(
        app_key: app.key,
        user_id: current_user.id,
        conversation: data['conversation'],
        trigger_id: data['trigger']
      )
  end

  def track_open(data)
    current_user.track_open(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_close(data)
    current_user.track_close(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_click(data)
    current_user.track_click(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_tour_finished(data)
    current_user.track_finish(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

  def track_tour_skipped(data)
    current_user.track_skip(
      trackable_id: data['trackable_id'],
      trackable_type: 'Message'
    )
  end

end
