module MessageApis::Cal
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      button = {}

      hidden = {
        id: "event_type",
        value: params[:ctx]["values"]["event_type"]["title"],
        type: "hidden"
      }

      button.merge!({
                      name: "book-meeting",
                      label: "schedule meeting",
                      type: "button",
                      align: "center",
                      width: "full",
                      action: {
                        type: "frame",
                        url: "/package_iframe_internal/Cal"
                      }
                    })

      definitions = [
        {
          text: "Cal.com schedule meeting",
          type: "text",
          style: "header",
          align: "center"
        },
        button,
        hidden
      ]

      {
        values: params[:ctx]["values"],
        definitions: definitions
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      {}
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      if ctx[:field] && ctx[:field]["type"] == "option"
        return {
          kind: "initialize",
          definitions: [
            {
              type: "text",
              text: ctx[:field]["text"]
            }
          ],
          results: {
            event_type: {
              id: ctx[:field]["id"],
              title: ctx[:field]["text"]
            }
          }
        }
      end

      event_types = ctx[:package].message_api_klass.event_types.filter { |o| !o["hidden"] }
      # Rails.logger.debug event_types
      {
        kind: "configure",
        definitions: [
          {
            type: "single-select",
            id: "checkbox-1",
            label: "Choose Event types",
            options: event_types.map do |item|
              {
                type: "option",
                id: item["id"],
                text: item["slug"],
                action: {
                  type: "submit"
                }
              }
            end
          }
        ]
      }
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
      # definitions = definitions_for_content(kind: kind, ctx: ctx)
      # {
      #  enabled_for_agents: true,
      #  definitions: definitions,
      #  values: ctx["values"]
      # }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params)
      @user = params[:user]
      @user.reload
      # @url = params.dig(:values, :url)
      # @conversation_key = params[:conversation_id]
      # @message_id = params[:message_id]
      # @name = @user[:name]
      # @email = @user[:email]

      @message = ConversationPart.find_by(key: params[:message_key])

      event_type = if @message.message.data.present?
                     @message.message.data.dig("event_type", "title")
                   elsif ((t = @message.message.blocks["schema"].find { |o| o["id"] == "event_type" })) && t.present?
                     t["value"]
                   end

      calendar_name = params["package"].settings["calendar_name"]
      @cal_link = "#{calendar_name}/#{event_type}"

      template = ERB.new <<~SHEET_VIEW
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>[Cal.com] Widget embed API</title>
            <style>
            body {
              margin: 0px;
            }
            </style>
            <script>
            (function (C, A, L) {
              let p = function (a, ar) {
                a.q.push(ar);
              };
              let d = C.document;
              C.Cal =
                C.Cal ||
                function () {
                  let cal = C.Cal;
                  let ar = arguments;
                  if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];
                    d.head.appendChild(d.createElement("script")).src = A;
                    cal.loaded = true;
                  }
                  if (ar[0] === L) {
                    const api = function () {
                      p(api, arguments);
                    };
                    const namespace = ar[1];
                    api.q = api.q || [];
                    typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
                    return;
                  }
                  p(cal, ar);
                };
              })(window, "https://cal.com/embed.js", "init");
              Cal("init")
            </script>
          </head>

          <body>
            <div class="container">

              <div id="cal-wrapper"></div>

              <script>
                Cal("inline", {
                  elementOrSelector: "#cal-wrapper", // You can also provide an element directly
                  calLink: "#{@cal_link}?metadata[mid]=#{@message.id}", // The link that you want to embed. It would open https://cal.com/jane in embed
                  config: {
                    name: "#{@user&.display_name}", // Prefill Name
                    email: "#{@user&.email}", // Prefill Email
                    // notes: "Chaskiq Meeting", // Prefill Notes
                    // guests: ["janedoe@gmail.com", "test@gmail.com"], // Prefill Guests
                    theme: "light", // "dark" or "light" theme
                  },
                  //metadata: {
                  //  bb: 123,
                  //  mid: "<%= @message.id %>"
                  //}
                });

                Cal("on", {
                  action: "bookingSuccessful",
                  callback: (e)=>{
                    // `data` is properties for the event.
                    // `type` is the name of the action(You can also call it type of the action.) This would be same as "ANY_ACTION_NAME" except when ANY_ACTION_NAME="*" which listens to all the events.
                    // `namespace` tells you the Cal namespace for which the event is fired/
                    const {data, type, namespace} = e.detail;
                    console.log(e.detail)

                    /*setTimeout(function(){
                      window.parent.postMessage({
                        chaskiqMessage: true,
                        type: "Cal",
                        status: "submit",
                        data: e.detail.data
                      }, "*")
                    }, 3000)*/

                  }
                })
              </script>
            </div>
          </body>
        </html>
      SHEET_VIEW

      template.result(binding)
    end
  end
end
