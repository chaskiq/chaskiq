# frozen_string_literal: true

class MessengerEventsChannel < ApplicationCable::Channel
  include UserFinder

  def subscribed
    if current_user.blank? || app.blank?
      reject
      return
    end
    stream_from "messenger_events:#{app.key}-#{current_user.session_id}"
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
  def get_banners_for_user
    Banner.broadcast_banner_to_user(current_user)
  end

  def get_tours_for_user
    Tour.broadcast_tour_to_user(current_user)
  end

  def get_tasks_for_user
    BotTask.broadcast_task_to_user(current_user)
  end

  def get_messages_for_user
    UserAutoMessage.broadcast_message_to_user(current_user)
  end
  #####

  def rtc_events(data)
    conversation = app.conversations.find_by(key: data['conversation_id'])
    key = "messenger_events:#{app.key}-#{current_user.session_id}"
    key2 = "events:#{app.key}"
    if data['event_type'] == 'JOIN_ROOM'
      ActionCable.server.broadcast key, {
        type: 'rtc_events',
        app: app.key,
        event_type: 'READY',
        conversation_id: conversation.key
      }
    end
    ActionCable.server.broadcast key2, data
  end

  def receive_conversation_part(data)
    ActionTrigger.receive_conversation_part(app, data, current_user)
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
    ActionTrigger.process_next_step(app, message, current_user)
  end

  def data_submit(data, message)
    ActionTrigger.data_submit(data, message)
  end

  def trigger_step(data)
    ActionTrigger.trigger_step(data, app, current_user)
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
