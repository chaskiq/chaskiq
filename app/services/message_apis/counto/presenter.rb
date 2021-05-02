module MessageApis::Counto
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      {
        # kind: kind,
        # ctx: ctx,
        wait_for_input: false,
        definitions: []
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      {
        # kind: kind,
        # ctx: ctx,
        definitions: []
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show
    # them configuration options before it’s inserted. Leaving this option
    # blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      api = ctx[:package].message_api_klass
      conversation_part = ctx[:package].app.conversation_parts.find_by(key: ctx[:conversation_part])
      json = JSON.parse(conversation_part.message.serialized_content)["blocks"]

      definitions = [
        {
          type: 'text',
          text: "send conversation key: #{conversation_part.key}",
          style: 'header'
        },
        { 
          "type": "input", 
          "id": "company_name", 
          "label": "Company name",
          "value": conversation_part.authorable.company_name,
          "placeholder": "Enter company name here...", 
          "save_state": "unsaved",
          'hint': 'will override company name on contact'
        },
        { 
          "type": "textarea", 
          "id": "command", 
          "label": "Command", 
          "placeholder": "Enter input here...", 
          "save_state": "unsaved" 
        },
        {
          type: "button", 
          id: "command-send", 
          variant: 'outlined', 
          size: 'small', 
          label: "send command", 
          action: { 
           type: "submit"
          }
        }
      ]

      if ctx[:field] && ctx[:field]["id"] === "command-send"
        definitions = [
          {
            type: 'text',
            text: "send conversation key: #{conversation_part.key}",
            style: 'header'
          },
          {
            type: 'text',
            text: "will send command: #{ctx.dig(:values, :command)}",
            style: 'paragraph'
          },
          {
            type: 'text',
            text: "will update company to: #{ctx.dig(:values, :command)}",
            style: 'paragraph'
          },

          {
            type: "button", 
            id: Base64.encode64(ctx[:values].to_json),
            name: 'command-confirm', 
            variant: 'success', 
            size: 'small', 
            label: "confirm", 
            action: { 
            type: "submit"
            }
          }
        ]
      end

      if ctx[:field] && ctx[:field]["name"] === "command-confirm"

        response = api.notify_conversation_part(
          conversation_part: conversation_part,
          command: Base64.decode64(ctx[:field]["id"])
        )

        response_message = response[:status] == 200 ? 'request succeed!' : 'response failed!'

        body = JSON.parse(response[:body]) rescue 'HTML content not available for preview' 

        definitions = [
          {
            type: 'text',
            text: response_message,
            style: 'header'
          },
          {
            type: 'text',
            text: "command sent!",
            style: 'paragraph'
          },
          {
            type: 'text',
            text: "service response status: #{response[:status]}",
            style: 'paragraph'
          },
          {
            type: 'text',
            text: "service response status: #{body}",
            style: 'paragraph'
          }
        ]
        definitions
      end 

      {
        kind: kind,
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      []
    end

  end
end
