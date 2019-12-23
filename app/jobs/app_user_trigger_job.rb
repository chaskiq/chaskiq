# frozen_string_literal: true

class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send the first trigger step
  def perform(app_key:, user_id:, trigger_id:, conversation:)
    @app = App.find_by(key: app_key)
    conversation = @app.conversations.find_by(key: conversation)
    @app_user = @app.app_users.find(user_id)
    trigger = begin
                @app.bot_tasks.find(trigger_id)
              rescue StandardError
                find_factory_template(trigger_id, @app_user)
              end
    conversation.blank? ? start_conversation(trigger) : add_message(trigger, conversation)
  end

  def start_conversation(trigger)
    author = @app.agents.first
    conversation = @app.conversations.create(
      main_participant: @app_user,
      initiator: author
      # assignee: options[:assignee]
    )

    add_message(trigger, conversation)
    # conversation = @app.start_conversation(options)
  end

  def add_message(trigger, conversation)
    author = @app.agent_bots.first
    step = trigger.paths.first.with_indifferent_access[:steps].first
    message = step[:messages].first
    @message = conversation.add_message(
      step_id: step[:step_uid],
      trigger_id: trigger.id,
      from: author,
      message: {
        html_content: message[:html_content],
        serialized_content: message[:serialized_content],
        text_content: message[:html_content]
      },
      controls: message[:controls]
    )
  end

  def find_factory_template(id, user)
    case id
    when 'infer'
      trigger = ActionTriggerFactory.infer_for(app: @app, user: user)
    when 'request_for_email'
      trigger = ActionTriggerFactory.request_for_email(app: @app)
      trigger
    when 'route_support'
      trigger = ActionTriggerFactory.route_support(app: @app)
      trigger
    when 'typical_reply_time'
      trigger = ActionTriggerFactory.typical_reply_time(app: @app)
      trigger
    else
      Error.new('template not found')
    end
  end
end
