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
                      {element: "input", type:"text", placeholder: "enter email", name: "email", label: "enter your email"},
                      {element: "separator"},
                      {element: "submit", label: "submit"}
                    ]
                }
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