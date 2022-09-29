module MessageApis::Whereby
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      {
        values: params[:ctx]["values"],
        definitions: [
          {
            type: "content"
          }
        ]
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      definitions = [
        {
          type: "text",
          text: "Whereby",
          align: "center",
          style: "header"
        }
      ]
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      if ctx.dig("field", "id") == "abc"
        if (meeting = ctx[:package].message_api_klass.create_meeting) && meeting
          return {
            kind: "initialize",
            definitions: [],
            results: meeting
          }
        else
          other = {
            type: "text",
            style: "notice-error",
            text: "error creating meeting"
          }
          return configure_definitions(ctx, other)
        end
      end

      configure_definitions(ctx)
    end

    def self.configure_definitions(ctx, other_blocks = nil)
      {
        kind: "configure",
        definitions: [
          other_blocks,
          {
            type: "text",
            text: "please configure the meeting"
          },

          {
            id: "abc",
            type: "button",
            label: "create a meeting",
            action: {
              type: "submit"
            }
          }
        ].compact,
        values: ctx["values"]
      }
    end

    def self.content_hook(kind:, ctx:)
      definitions = definitions_for_content(kind: kind, ctx: ctx)
      {
        enabled_for_agents: true,
        definitions: definitions,
        values: ctx["values"]
      }
    end

    def self.definitions_for_content(kind:, ctx:)
      conversation = ctx[:package].app.conversations.find_by(key: ctx[:conversation_key])
      message = conversation.messages.find_by(key: ctx[:message_key])
      user = conversation&.main_participant

      data = {
        app_id: ctx[:package].app.id,
        package_id: ctx[:package].id,
        conversation_key: ctx[:conversation_key],
        lang: ctx[:lang],
        message_key: ctx[:message_key],
        message_data: message&.message&.data,
        current_user_id: ctx[:current_user].as_json
      }

      token = CHASKIQ_FRAME_VERIFIER.generate(data)

      button = {
        id: "call-button",
        name: "book-meeting",
        label: "start a videocall",
        type: "button",
        align: "center",
        width: "full",
        action: {
          type: "submit"
        }
      }

      if ctx[:current_user].is_a?(Agent)
        # if ctx[:location] == "conversation" && conversation.present?
        button.merge!({ action: {
                        type: "url",
                        url: "#{Chaskiq::Config.get(:host)}/package_iframe/Whereby?token=#{token}",
                        options: "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=270,left=200,top=100"
                        # url: "/package_iframe_internal/TwilioPhone"
                      } })
      else
        button.merge!({
                        name: "book-meeting",
                        label: "Whereby videocall session",
                        type: "button",
                        align: "center",
                        width: "full",
                        action: {
                          type: "frame",
                          url: "/package_iframe_internal/Whereby"
                        }
                      })
      end

      definitions = [
        {
          text: "Whereby videocall session",
          type: "text",
          style: "header",
          align: "center"
        },
        button
      ]
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params)
      # @user = params[:user]
      # @url = params.dig(:values, :url)
      # @conversation_key = params[:conversation_id]
      # @message_id = params[:message_id]
      # @name = @user[:name]
      # @email = @user[:email]

      @message = ConversationPart.find_by(key: params[:message_key])

      template = ERB.new <<~SHEET_VIEW
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>[Whereby] Widget embed API</title>
            <style>
            body {
              margin: 0px;
            }
            whereby-embed{
              width: 100%;
              height: 100%;
              border: none;
            }
            </style>
            <script type=module src="https://cdn.srv.whereby.com/embed/v1.js"></script>

            <script>
              function listenWherebyEvents(){
                const elm = document.querySelector("whereby-embed");
                const output = document.querySelector("output");

                function logEvent(event) {
                  const log = `got event ${JSON.stringify({ type: event.type, detail: event.detail })}`;
                  console.log(log)
                }

                elm.addEventListener("ready", logEvent)
                elm.addEventListener("knock", logEvent)
                elm.addEventListener("participantupdate", logEvent)
                elm.addEventListener("join", logEvent)
                elm.addEventListener("leave", logEvent)
                elm.addEventListener("participant_join", logEvent)
                elm.addEventListener("participant_leave", logEvent)
                elm.addEventListener("microphone_toggle", logEvent)
                elm.addEventListener("camera_toggle", logEvent)
              }
            </script>
          </head>

          <body>
            <div class="container">
              <whereby-embed minimal room="<%= @message.message.data["roomUrl"] %>"></whereby-embed>
            </div>
            <script>
              listenWherebyEvents()
            </script>
          </body>
        </html>
      SHEET_VIEW

      template.result(binding)
    end
  end
end
