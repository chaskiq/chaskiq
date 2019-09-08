class ActionTriggerFactory 

  def initialize
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

  def controls(options: [], uuid:)
    { 
      "step_uid": uuid,
      "type":"messages",
      "messages":[ 

      ],
      "controls":{ 
        "type":"ask_option",
        "schema": options,
        "wait_for_input":true
      }
    }
  end

  def button(text: , next_uuid:)
    { 
      "id":"a67d247d-7b81-4f87-b172-e8b87371d921",
      "element":"button",
      "label": text,
      "next_step_uuid": next_uuid
    }
  end

  def input(label:, placeholder: "")
    {
      element: "input",
      id: "",
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


end