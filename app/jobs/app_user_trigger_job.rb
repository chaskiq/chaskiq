# frozen_string_literal: true

class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send the first trigger step
  def perform(app_key:, user_id:, trigger_id:, conversation:)
    @app = App.find_by(key: app_key)
    conversation = @app.conversations.find_by(key: conversation)
    @app_user = @app.app_users.find(user_id)
    
    return if @app_user.trigger_locked.value.present?

    @app_user.trigger_locked.value = 1

    trigger = begin
                @app.bot_tasks.find(trigger_id)
              rescue StandardError
                ActionTriggerFactory.find_factory_template(
                  app: @app, 
                  app_user: @app_user, 
                  data: {'trigger'=> trigger_id} 
                )
              end

    conversation.blank? ? 
      start_conversation(trigger) : 
      add_message(trigger, conversation)

  end

  def start_conversation(trigger)
    author = @app.agent_bots.first
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

end
