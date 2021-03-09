class ActionTrigger
  def self.trigger_step(data, app, current_user)
    conversation = app.conversations.find_by(key: data['conversation_key'])

    message = conversation.messages.find_by(key: data['message_key'])

    trigger, path = ActionTriggerFactory.find_task(
      data: data,
      app: app,
      app_user: current_user
    )

    next_step = path['steps'].find do |o|
      o['step_uid'] == data['step']
    end

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

    if message.from_bot? && data['reply'].present?
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

    if next_step['controls'].present?
      conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step['controls']
      )
    end
  end

  def self.data_submit(data, message)
    message.message.save_replied(data) if message.message.respond_to?(:save_replied)
  end

  def self.process_next_step(app, message, current_user)
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
      handle_follow_actions(app, path, message)
      return
    end

    author = app.agent_bots.first

    m = next_step['messages'].first

    if m.present?
      message = message.conversation.add_message(
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
      message = message.conversation.add_message(
        step_id: next_step[:step_uid],
        trigger_id: trigger.id,
        from: author,
        controls: next_step['controls']
      )
    end
  end

  def self.handle_follow_actions(app, path, message)
    follow_actions = path['follow_actions']
    return if follow_actions.blank?

    follow_actions.each do |action|
      process_follow_action(app, action, message)
    end
  end

  def self.process_follow_action(app, action, message)
    conversation = message.conversation
    case action['key']
    when 'assign'
      # assign_user
      return if action['value'].blank?

      agent = app.agents.find_by(id: action['value'])
      return if agent.blank?

      conversation.assign_user(agent)
    when 'close'
      conversation.close
    end
  end

  def self.receive_conversation_part(app, data, current_user)
    conversation = app.conversations.find_by(key: data['conversation_key'])
    message = conversation.messages.find_by(key: data['message_key'])

    # if the message was read skip processing
    # this will avoid message duplication
    return if message.read?

    message.read! if message.authorable != current_user

    if message.from_bot?
      process_next_step(app, message, current_user)

      #### TODO: to be deprecated in favor of app packages
      if data['submit'].present? && message.message&.blocks&.dig('type') == 'data_retrieval'
        opts = app.searcheable_fields_list
        current_user.update(data['submit'].slice(*opts)) # some condition from settings here?
        data_submit(data['submit'], message)
      end

      data_submit(data['reply'], message) if data['reply'].present?
    end
  end
end
