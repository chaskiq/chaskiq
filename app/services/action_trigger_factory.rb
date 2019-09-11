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
            "html_content":"hola"
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
          c.message(text: "Hi can we help?, are you an existing customer ?.", uuid: 1),
          c.controls(
            uuid: 2,
            type: "ask_option",
            schema: [
              c.button(
                label: "i'm existing customer", 
                next_uuid: 3,
              ),
              c.button(
                label: "no , i'm not an existing customer", 
                next_uuid: 4,
              )
            ]
          )
        ]
      )
      c.path(
        title: "yes",
        steps: [
          c.message(text: "that's great!", uuid: 3)
        ],
        follow_actions: [c.assign(10)]
      )
      c.path(
        title: "no",
        steps: [
          c.message(text: "oh , that sad :(", uuid: 4)
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
        c.message(text: "molte gratzie", uuid: 4),
      ]

      if app.user_tasks_settings["share_typical_time"] && kind === "AppUser"
        path_messages << [
            c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1),
          ]
      end

      if kind === "Lead" 

        if app.lead_tasks_settings["share_typical_time"]
          path_messages << c.message(text: "Hi, #{app.name} will reply as soon as they can.", uuid: 1)
        end

        if app.email_requirement === "Always"
          path_messages << email_requirement 
        end
     
        if app.email_requirement === "office" && !app.in_business_hours?( Time.current )
          path_messages << email_requirement
        end

        if routing = app.lead_tasks_settings["routing"].present?
          follow_actions << c.close() if routing == "close"
          follow_actions << c.assign(10) if routing == "assign"
        end

      end

      path_options = {
        title: "typical_reply_time" , 
        steps: path_messages.flatten, 
      }

      path_options.merge({
        follow_actions: follow_actions
      })

      c.path(path_options)

    end

    subject

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