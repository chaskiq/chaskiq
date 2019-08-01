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
        actions: [
          open_messenger: true,
          message: {
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