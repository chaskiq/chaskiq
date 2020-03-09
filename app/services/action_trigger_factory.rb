# frozen_string_literal: true

class ActionTriggerFactory
  attr_accessor :id, :after_delay, :paths

  def initialize
    @id
    @paths = []
  end

  def config
    yield(self)
  end

  #Give the team a way to reach you:

  #Get notified by email

=begin
  def self.request_for_email(app:)
    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.id = 'request_for_email'
      c.after_delay = 2
      c.path(
        title: 'request_for_email',
        steps: [
          c.message(text: 'give us a way to reach you.', uuid: 1),
          c.controls(
            uuid: 2,
            type: 'data_retrieval',
            schema: [
              c.input(
                label: 'enter your email',
                name: 'email',
                placeholder: 'enter your email'
              )
            ]
          ),
          c.message(text: 'Thanks you will be contact asap with one of our agents', uuid: 3)
        ],
        follow_actions: [c.assign(app.agents.first)]
      )
    end

    subject
  end

  def self.route_support(app:)
    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.id = 'route_support'
      c.after_delay = 2
      c.path(
        title: 'route_support',
        steps: [
          c.message(text: 'are you an existing customer ?.', uuid: 1),
          c.controls(
            uuid: 2,
            type: 'ask_option',
            schema: [
              c.button(
                label: "yes, I'm an existing customer",
                next_uuid: 3
              ),
              c.button(
                label: "no, I'm not an existing customer",
                next_uuid: 4
              )
            ]
          )
        ]
      )
      c.path(
        title: 'yes',
        steps: [
          c.message(text: 'great!', uuid: 3)
        ],
        follow_actions: [c.assign(10)]
      )
      c.path(
        title: 'no',
        steps: [
          c.message(text: "oh, that's so sad :(", uuid: 4)
        ],
        follow_actions: [c.assign(10)]
      )
    end

    subject
  end

  def self.typical_reply_time(app:)
    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.id = 'typical_reply_time'
      c.after_delay = 2
      c.path(
        title: 'typical_reply_time',
        steps: [
          c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1)
        ]
      )
    end
    subject
  end
=end

  def self.infer_for(app:, user:)
    kind = user.model_name.name

    I18n.locale = user.lang

    subject = ActionTriggerFactory.new

    bot_agent = app.agents.bots.first

    subject.config do |c|
      c.id = 'infer'
      c.after_delay = 2

      path_messages = []
      follow_actions = []

      email_requirement = [
        c.message(
          text: I18n.t("task_bots.email_requirement.message"), 
          uuid: 2,
          agent: bot_agent
        ),
        c.controls(
          uuid: 3,
          type: 'data_retrieval',
          schema: [
            c.input(
              label: I18n.t("task_bots.email_requirement.input_label"),
              name: 'email',
              placeholder: I18n.t("task_bots.email_requirement.placeholder")
            )
          ]
        ),
        c.message(
          text: I18n.t("task_bots.email_requirement.ack"), 
          uuid: 4,
          agent: bot_agent
        )
      ]

      route_support = [
        c.message(
          text: I18n.t("task_bots.support.ask", name: app.name) , 
          uuid: 5,
          agent: bot_agent),
        c.controls(
          uuid: 6,
          type: 'ask_option',
          schema: [
            c.button(
              label: I18n.t("task_bots.support.options.op1"),
              next_uuid: 7
            ),
            c.button(
              label: I18n.t("task_bots.support.options.op2"),
              next_uuid: 8
            )
          ]
        )
      ]

      if kind === 'AppUser'
        path_messages << [
          c.message(
            text: I18n.t("task_bots.reply_soon", {name: app.name}), 
            uuid: 1,
            agent: bot_agent
          )
        ]
      end

      if (kind === 'Lead') || (kind === 'Visitor')

        if app.lead_tasks_settings['share_typical_time']
          path_messages << c.message(
            text: I18n.t("task_bots.reply_soon", {name: app.name}), 
            uuid: 1,
            agent: bot_agent
            )
        end

        if user.email.blank?
          path_messages << route_support
          path_messages.flatten!
        end

        routing = app.lead_tasks_settings['routing']

        if routing.present?

          follow_actions << c.close if routing == 'close'

          if routing == 'assign' && app.lead_tasks_settings['assignee'].present?
            follow_actions << c.assign(app.lead_tasks_settings['assignee'])
          end
        end

      end

      path_options = {
        title: 'typical_reply_time',
        steps: path_messages.flatten
      }

      path_options.merge!(
        follow_actions: follow_actions
      )

      c.path(path_options)

      step_7 = [c.message(
        text: I18n.t("task_bots.reply_agent", {name: app.name}), 
        uuid: 7, 
        agent: bot_agent
      )]

      if user.email.blank?

        if app.email_requirement === 'Always'
          step_7 << email_requirement
          step_7.flatten!
        end

        if app.email_requirement === 'office' && !app.in_business_hours?(Time.current)
          step_7 << email_requirement
          step_7.flatten!
        end
      #else
      #  step_7 << c.message(
      #    text: I18n.t('bot_tasks.email_support'), 
      #    uuid: 4,
      #    agent: bot_agent
      #  )
      end

      #puts 'STEP 7'
      #puts step_7

      c.path(
        title: 'yes',
        steps: step_7,
        follow_actions: [c.assign(app.lead_tasks_settings['assignee'])]
      )

      c.path(
        title: 'no',
        steps: [
          c.message(
            text: I18n.t("task_bots.support.reply.op2"), 
            uuid: 8,
            agent: bot_agent
          )
        ],
        follow_actions: [c.close]
      )
    end

    subject
  end

  def self.find_factory_template(app:, app_user:, data:)
    case data['trigger']
    when 'infer'
      trigger = ActionTriggerFactory.infer_for(app: app, user: app_user)
    when 'request_for_email'
      trigger = ActionTriggerFactory.request_for_email(app: app)
      trigger
    when 'route_support'
      trigger = ActionTriggerFactory.route_support(app: app)
      trigger
    when 'typical_reply_time'
      trigger = ActionTriggerFactory.typical_reply_time(app: app)
      trigger
    else
      raise 'trigger template not found'
    end
  end

  def self.find_task(data:, app:, app_user:)
    trigger = begin
                app.bot_tasks.find(data['trigger'])
              rescue StandardError
                find_factory_template(
                  data: data, 
                  app: app, 
                  app_user: app_user
                )
              end

    step = data['step'].to_s
    path = trigger.paths.find do |o|
      o.with_indifferent_access['steps'].find do |a|
        a['step_uid'].to_s === step
      end.present?
    end.with_indifferent_access

    [trigger, path]
  end

  def path(title: '', follow_actions: [], steps: [])
    @paths << { title: title, follow_actions: follow_actions, steps: steps }
  end

  def message(text:, uuid:, agent:)
    {
      "step_uid": uuid,
      "type": 'messages',
      "messages": [
        {
          "app_user": {
            "display_name": agent.name,
            "email": agent.email,
            "id": agent.id,
            "kind": 'agent'
          },
          "serialized_content": "{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
          "html_content": text
        }
      ]
    }
  end

  def controls(schema: [], wait_for_input: true, uuid:, type:)
    {
      "step_uid": uuid,
      "type": 'messages',
      "messages": [

      ],
      "controls": {
        "type": type,
        "schema": schema,
        "wait_for_input": wait_for_input
      }
    }
  end

  def button(label:, next_uuid:)
    {
      "element": 'button',
      "label": label,
      "next_step_uuid": next_uuid
    }
  end

  def input(label:, name:, placeholder: '')
    {
      element: 'input',
      id: '',
      name: name,
      label: label,
      placeholder: placeholder,
      type: 'text'
    }
  end

  def assign(id)
    {
      "key": 'assign',
      "name": 'assign',
      "value": id
    }
  end

  def close
    {
      "key": 'close',
      "name": 'close'
    }
  end

  def to_obj
    JSON.parse(to_json, object_class: OpenStruct)
  end

end
