module MessageApis::Calendly
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      url = params[:ctx][:values][:url]
      text = params[:ctx][:values][:invitation_text]

      definitions = [
        {
          type: 'text',
          text: text,
          align: 'left',
          style: 'muted'
        },
        {
          name: 'book-meeting',
          label: params[:ctx][:values][:label],
          type: 'button',
          align: 'center',
          width: 'full',
          action: {
            type: 'frame',
            url: '/package_iframe_internal/Calendly'
          }
        }
      ]

      {
        kind: 'initialize',
        definitions: definitions,
        values: params[:ctx][:values]
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      definitions = [
        {
          type: 'text',
          text: 'Calendly',
          align: 'center',
          style: 'header'
        }
      ]

      if (event = params.dig(:ctx, :values, 'data', 'event')) && event
        case event
        when 'calendly.event_scheduled'
          definitions << {
            type: 'text',
            text: 'Scheduled!',
            align: 'center',
            style: 'header'
          }
        end
      end

      {
        kind: 'submit',
        definitions: definitions,
        values: params[:ctx][:values]
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      calendar_input = {
        name: 'calendar',
        type: 'input',
        id: 'calendar_url',
        placeholder: 'your calendly url',
        label: 'calendly url'
      }

      button_label = {
        name: 'label',
        type: 'input',
        id: 'label',
        placeholder: 'book a meeting',
        label: 'Button text'
      }

      invitation_text = {
        name: 'invitation_text',
        type: 'input',
        id: 'invitation_text',
        placeholder: "meet with #{ctx[:package].app.name} team",
        label: 'Invitation text'
      }

      action = {
        name: 'set_url',
        label: 'set your calendar',
        id: 'alo',
        type: 'button',
        action: {
          type: 'submit'
        }
      }

      definitions = [
        calendar_input,
        button_label,
        invitation_text,
        action
      ]

      if ctx.dig(:field, :name) == 'set_url' &&
         ctx.dig(:field, :action, :type) === 'submit'

        url = ctx.dig(:values, :calendar)
        label = if ctx.dig(:values, :label).blank?
                  'Book a meeting'
                else
                  ctx.dig(:values, :label)
                end

        invitation = if ctx.dig(:values, :invitation_text).blank?
                       "meet with #{ctx[:package].app.name} team"
                     else
                       ctx.dig(:values, :invitation_text)
                     end

        unless valid_url?(url)
          input = calendar_input
          input.merge!(
            errors: 'not a valid url',
            value: url
          )

          definitions = [
            input,
            button_label,
            invitation_text,
            action
          ]
          return {
            kind: kind,
            definitions: definitions
          }
        end

        return {
          kind: 'initialize',
          definitions: definitions,
          results: {
            url: url,
            label: label,
            invitation_text: invitation
          }
        }

      end

      { kind: kind, ctx: ctx, definitions: definitions }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params)
      @user = params[:user]
      @url = params.dig(:values, :url)
      @conversation_key = params[:conversation_id]
      @message_id = params[:message_id]
      @name = @user[:name]
      @email = @user[:email]

      template = ERB.new <<~SHEET_VIEW
                            <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                                <title>[Calendly] Widget embed API example</title>
                                <style>
                  #{'              '}
                                body {
                                  background: url('https://www.toptal.com/designers/subtlepatterns/patterns/restaurant_icons.png');
                                  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;#{'  '}
                                  margin: 0px;
                                }
        #{'          '}
                                h1 {
                                  font-size: 50px;
                                  text-align: center;
                                }
        #{'          '}
                                .container {
                                  margin: 0 auto;
                                  width: 100%;
                                }
        #{'          '}
                                .container p, .container h2 {
                                  text-align: center;
                                }
                  #{'              '}
                                </style>
                              </head>
        #{'          '}
                              <body>
                                <div class="container">
                                  <!-- This Calendly is the DOM element that will contain your embedded typeform -->
                                  <div class="calendly-inline-widget"#{' '}
                                    style="min-width:320px;height:580px;"#{' '}
                                    data-auto-load="false">
                                    <!-- Calendly inline widget begin -->
                                    <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js"></script>
                                    <script>
                                      Calendly.initInlineWidget({
                                        url: '<%= @url %>',
                                        prefill: {
                                          name: '<%= @name %>',
                                          email: '<%= @email %>',
                                          customAnswers: {
                                              //a1: "Yes",
                                              //a2: "At the Starbucks on 3rd and 16th"
                                          }
                                        },
                                        utm: {
                                            utmCampaign: "Conversation",
                                            utmSource: "<%= @conversation_key %>",
                                            utmMedium: "ConversationMessage",
                                            utmContent: "<%= @message_id %>",
                                            utmTerm: "Chaskiq"
                                        }
                                      });
        #{'          '}
                                      function isCalendlyEvent(e) {
                                        return e.data.event &&
                                              e.data.event.indexOf('calendly') === 0;
                                      };
                  #{'                    '}
                                      window.addEventListener(
                                        'message',
                                        function(e) {
                                          //console.log("ENENE", e)
                                          if (isCalendlyEvent(e) && e.data.event === "calendly.event_scheduled") {
                                            window.parent.postMessage({
                                              chaskiqMessage: true,#{' '}
                                              type: "Calendly",#{' '}
                                              status: "submit",
                                              data: e.data
                                            }, "*")
                                          }
                                        }
                                      );
        #{'          '}
                                    </script>
                                  </div>
                  #{'              '}
                                </div>
        #{'          '}
                              </body>
                            </html>
      SHEET_VIEW

      template.result(binding)
    end
  end
end
