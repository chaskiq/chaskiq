class ActionTriggerFactory 

  attr_accessor :id, :after_delay, :paths

  def initialize
    @id
    @paths = []
  end
  
  def config()
    yield(self)
  end

  def path(title: "" , follow_actions: [] , steps: [])
    @paths << {title: title, follow_actions: follow_actions, steps: steps}
  end

  def message(text:, uuid:)
     
      { 
        "step_uid": uuid,
        "type":"messages",
        "messages":[ 
          { 
            "app_user":{ 
              "display_name":"chaskiq bot",
              "email":"bot@chaskiq.io",
              "id":1,
              "kind":"agent"
            },
            "serialized_content":"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
            "html_content": text
          }
        ]
      }
    
  end

  def controls(schema: [], wait_for_input: true, uuid:, type: )
    { 
      "step_uid": uuid,
      "type":"messages",
      "messages":[ 

      ],
      "controls":{ 
        "type":type,
        "schema": schema,
        "wait_for_input":wait_for_input
      }
    }
  end

  def button(label: , next_uuid: )
    {
      "element":"button",
      "label": label,
      "next_step_uuid": next_uuid
    }
  end

  def input(label:, name:, placeholder: "")
    {
      element: "input",
      id: "",
      name: name,
      label: label,
      placeholder: placeholder,
      type: "text"
    }

  end

  def assign(id)
    { 
      "key":"assign",
      "name":"assign",
      "value":id
    }
  end

  def close()
    { 
      "key":"close",
      "name":"close"
    }
  end

  def to_obj
    JSON.parse(self.to_json, object_class: OpenStruct)
  end

  def self.request_for_email(app:)
    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.id = "request_for_email"
      c.after_delay = 2
      c.path(
        title: "request_for_email" , 
        steps: [
          c.message(text: "give us a way to reach you.", uuid: 1),
          c.controls(
            uuid: 2,
            type: "data_retrieval",
            schema: [
              c.input(
                label: "enter your email", 
                name: "email", 
                placeholder: "enter your email"
              )
            ]
          ),
          c.message(text: "molte gratzie", uuid: 3),
        ],
        follow_actions: [c.assign(10)],
      )
    end

    subject
  end


  def self.route_support(app:)
    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.id = "route_support"
      c.after_delay = 2
      c.path(
        title: "route_support" , 
        steps: [
          c.message(text: "are you an existing customer ?.", uuid: 1),
          c.controls(
            uuid: 2,
            type: "ask_option",
            schema: [
              c.button(
                label: "yes, I'm an existing customer", 
                next_uuid: 3,
              ),
              c.button(
                label: "no, I'm not an existing customer", 
                next_uuid: 4,
              )
            ]
          )
        ]
      )
      c.path(
        title: "yes",
        steps: [
          c.message(text: "great!", uuid: 3)
        ],
        follow_actions: [c.assign(10)]
      )
      c.path(
        title: "no",
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
      c.id = "typical_reply_time"
      c.after_delay = 2
      c.path(
        title: "typical_reply_time" , 
        steps: [
          c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1),
        ]
      )
    end
    subject
  end

  def self.infer_for(app: , user:)

    kind = user.model_name.name

    subject = ActionTriggerFactory.new

    subject.config do |c|
      c.id = "infer"
      c.after_delay = 2

      path_messages = []
      follow_actions = []

      email_requirement = [
        c.message(text: "give us a way to reach you.", uuid: 2),
        c.controls(
          uuid: 3,
          type: "data_retrieval",
          schema: [
            c.input(
              label: "enter your email", 
              name: "email", 
              placeholder: "enter your email"
            )
          ]
        ),
        c.message(text: "thank you", uuid: 4),
      ] 

      route_support = [
        c.message(text: "Are you an existing customer ?.", uuid: 5),
        c.controls(
          uuid: 6,
          type: "ask_option",
          schema: [
            c.button(
              label: "I'm existing customer", 
              next_uuid: 7,
            ),
            c.button(
              label: "No , I'm not an existing customer", 
              next_uuid: 8,
            )
          ]
        )
      ]


      if kind === "AppUser"
        path_messages << [
            c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1),
          ]
      end

      if kind === "Lead" or kind === "Visitor"

        if app.lead_tasks_settings["share_typical_time"]
          path_messages << c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1)
        end

        if user.email.blank?
          path_messages << route_support 
          path_messages.flatten!
        end

        routing = app.lead_tasks_settings["routing"]
        
        if routing.present?
          
          follow_actions << c.close() if routing == "close"

          if routing == "assign" && app.lead_tasks_settings["assignee"].present?
            follow_actions << c.assign(app.lead_tasks_settings["assignee"])
          end
        end

      end

      path_options = {
        title: "typical_reply_time" , 
        steps: path_messages.flatten, 
      }

      path_options.merge!({
        follow_actions: follow_actions
      })


      c.path(path_options)

      step_7 = [c.message(text: "that's great!", uuid: 7)]

      if user.email.blank?
        if app.email_requirement === "Always"
          step_7 << email_requirement 
          step_7.flatten!
        end
    
        if app.email_requirement === "office" && !app.in_business_hours?( Time.current )
          step_7 << email_requirement
          step_7.flatten!
        end
      else
        step_7 << c.message(text: "molte gratzie", uuid: 4)
      end



      c.path(
        title: "yes",
        steps: step_7,
        follow_actions: [c.assign(app.lead_tasks_settings["assignee"])]
      )

      c.path(
        title: "no",
        steps: [
          c.message(text: "oh , that's sad :(", uuid: 8)
        ],
        follow_actions: [c.close()]
      )

    end

    subject

  end

  def self.find_factory_template(app:, app_user:, data:)
      case data["trigger"]
        when "infer"
          trigger = ActionTriggerFactory.infer_for(app: app, user: app_user )
        when "request_for_email"
          trigger = ActionTriggerFactory.request_for_email(app: app)
          return trigger
        when "route_support"
          trigger = ActionTriggerFactory.route_support(app: app)
          return trigger
        when "typical_reply_time"
          trigger = ActionTriggerFactory.typical_reply_time(app: app)
          return trigger
        else
        Error.new("template not found") 
      end
  end

  def self.find_task(data: , app: , app_user: )
    trigger = app.bot_tasks.find(data["trigger"]) rescue self.find_factory_template(data: data, app: app, app_user: app_user)

    path = trigger.paths.find{|o| 
        o.with_indifferent_access["steps"].find{|a| 
          a["step_uid"].to_s === data["step"].to_s
      }.present? 
    }.with_indifferent_access
    
    return trigger, path
  end

  def reply_options
    [
      {value: "auto", label: "Automatic reply time. Currently El equipo responderá lo antes posible"}, 
      {value: "minutes", label: "El equipo suele responder en cuestión de minutos."},
      {value: "hours", label: "El equipo suele responder en cuestión de horas."},
      {value: "1 day", label: "El equipo suele responder en un día."},
    ]
  end



end