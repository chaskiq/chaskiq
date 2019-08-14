=begin
  ui triggers

  actions:
    + message
    + open messenger
    + play sound

  trigger events:
    + on leave
    + on pages
    + on url parameters
    + on user data
    + after delay
=end


class Trigger


  def self.definition
    [ {
        id: "some-trigger",
        after_delay: 4.seconds,
        rules: [
          {pages_pattern: "/tester(/:id)"},
        ],
        paths: [
          {
            id: "1",
            title: "hey",
            steps: [
              {
                type: "message",
                wait_for_input: true,
                lock: true,
                message: {
                  app_user: {
                    display_name: "miguel michelson",
                    email: "miguelmichelson@gmail.com",
                    id: 1,
                    kind: "agent" 
                  },
                  serialized_content: '{"blocks":[{"key":"9oe8n","text":"hola","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                  html_content: "hola", 
                },
                controls: {
                  type: "ask_for_email",
                  schema: [
                      {element: "button", label: "yes", next_step_uuid: 2},
                      {element: "button", label: "no", next_step_uuid: 3},
                      {element: "button", label: "maybe", next_step_uuid: 4}
                      #{element: "input", type:"text", placeholder: "enter email", name: "email", label: "enter your email"},
                      #{element: "separator"},
                      #{element: "submit", label: "submit"}
                    ]
                }
              },
              {
                step_uid: 2,
                type: "message",
                wait_for_input: false,
                lock: true,
                message: {
                  app_user: {
                    display_name: "miguel michelson",
                    email: "miguelmichelson@gmail.com",
                    id: 1,
                    kind: "agent" 
                  },
                  serialized_content: '{"blocks":[{"key":"9oe8n","text":"ya la raja gracias, manda el mail","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                  html_content: "hola", 
                },
                controls: {
                  type: "ask_for_email",
                  lock: true,
                  schema: [
                      {
                        element: "input", type:"text", 
                        placeholder: "enter email", 
                        name: "email", 
                        label: "enter your email",
                        next_step_uuid: 4 
                      },
                      {element: "separator"},
                      {element: "submit", label: "submit"}
                    ]
                }
              },

              {
                step_uid: 3,
                type: "message",
                wait_for_input: false,
                message: {
                  app_user: {
                    display_name: "miguel michelson",
                    email: "miguelmichelson@gmail.com",
                    id: 1,
                    kind: "agent" 
                  },
                  serialized_content: '{"blocks":[{"key":"9oe8n","text":"no me guei po!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                  html_content: "hola", 
                },
              },

              {
                step_uid: 4,
                type: "message",
                wait_for_input: false,
                message: {
                  app_user: {
                    display_name: "miguel michelson",
                    email: "miguelmichelson@gmail.com",
                    id: 1,
                    kind: "agent" 
                  },
                  serialized_content: '{"blocks":[{"key":"9oe8n","text":"gracias compita, ahora cuenteme","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                  html_content: "hola", 
                },
              }


            ]
          }
        ],
        actions: [
          open_messenger: true,
          
          message: {
            app_user: {
              display_name: "miguel michelson",
              email: "miguelmichelson@gmail.com",
              id: 1,
              kind: "agent" 
            },
            serialized_content: '{"blocks":[{"key":"9oe8n","text":"hola","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
            html_content: "hola"
          },
          packages: [
            {name: :ask_for_email}
          ]
        ]
      },

    ] 
  end

end