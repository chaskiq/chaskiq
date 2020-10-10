# frozen_string_literal: true
require 'uri'
require 'erb'

def valid_url?(uri)
  uri = URI.parse(uri).try(:host)
rescue URI::InvalidURIError
  false
end

module MessageApis
  class Calendly
    # https://developer.calendly.com/docs
    BASE_URL = 'https://calendly.com/api/v1/'

    attr_accessor :secret

    def initialize(config:)
      @secret = secret

      @api_token = config["api_secret"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = { 
        'X-TOKEN' => @api_token, 
        'Content-Type'=> 'application/json'
      }
    end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def trigger(event)
      #case event.action
      #when 'email_changed' then register_contact(event.eventable)
      #end
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      @package = package
      event = params["event"]
      payload = params["payload"]
      case event
      when "invitee.created" then handle_created_invitee(payload)
      when "invitee.canceled" then handle_cancelled_invitee(payload)
      end
    end

    def handle_cancelled_invitee(payload)
    end

    def handle_created_invitee(payload)
      conversation = @package.app.conversations.find_by(
        key: payload["tracking"]["utm_source"]
      )

      return if conversation.blank?

      message = conversation.messages.find(
        payload["tracking"]["utm_content"]
      )

      return if message.blank?

      # should format here
      message.message.save_replied(payload["event"])
    end

    def register_webhook(app_package, integration)
      subscription_url = "#{ENV['HOST']}/api/v1/hooks/#{integration.app.key}/#{app_package.name.underscore}/#{integration.id}"
      data = {
        url: subscription_url,
        events: ['invitee.created', 'invitee.canceled']
      }
      url = url('/hooks')
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = data.to_json
      end
    end

    def get_webhooks
      url = url("/hooks")
      response = @conn.get(url, nil )
      JSON.parse(response.body)
    end

    def delete_webhook(id)
      url = url("/hooks/#{id}")
      response = @conn.delete(url, nil )
    end

    def delete_webhooks
      get_webhooks["data"].map{|o| delete_webhook(o["id"])}
    end

    # for display in replied message
    def self.display_data(data)
      return if data.blank?
      k = data["cancelled"] ? "canceled" : "confirmed"
      {
        "#{k}": "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}",
        formatted_text: "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}"
      }
    end

    class PresenterManager

      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
      def self.initialize_hook(params)

        url = params[:ctx][:values][:url]
        text = params[:ctx][:values][:invitation_text]

        definitions = [
          {
            type: "text",
            text: text,
            align: "left",
            style: "muted"
          },
          {
            name: 'book-meeting',
            label: params[:ctx][:values][:label],
            type: 'button',
            align: 'center',
            width: 'full',
            action: {
              type: "frame",
              url: "/package_iframe_internal/Calendly" 
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
            "type":  "text",
            "text":  "Calendly",
            "align": "center",
            "style": "header"
          }
        ]

        if event = params.dig(:ctx,:values, "data", "event")
          case event
          when "calendly.event_scheduled"
            definitions << {
              "type":  "text",
              "text":  "Scheduled!",
              "align": "center",
              "style": "header"
            }
          else
            
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
      def self.configure_hook(kind: , ctx:)

          calendar_input = {
            name: 'calendar',
            type: 'input',
            id: 'calendar_url',
            placeholder: 'your calendly url',
            label: 'calendly url',
          }

          button_label = {
            name: 'label',
            type: 'input',
            id: 'label',
            placeholder: 'book a meeting',
            label: 'Button text',
          }

          invitation_text = {
            name: 'invitation_text',
            type: 'input',
            id: 'invitation_text',
            placeholder: "meet with #{ctx.dig(:app).name} team",
            label: 'Invitation text',
          }

          action = {
            name: 'set_url',
            label: 'set your calendar',
            type: 'button',
            action: {
              type: "submit" 
            }
          }

          definitions = [
            calendar_input,
            button_label,
            invitation_text,
            action
          ]
          
          if ctx.dig(:field, :name) == "set_url" && 
            ctx.dig(:field, :action, :type) === "submit"

            url = ctx.dig(:values, :calendar)
            label = !ctx.dig(:values, :label).blank? ? 
              ctx.dig(:values, :label) : 'Book a meeting'

            invitation = !ctx.dig(:values, :invitation_text).blank? ? 
              ctx.dig(:values, :invitation_text) : "meet with #{ctx.dig(:app).name} team"


            if !valid_url?(url)
              input = calendar_input
              input.merge!(
                errors: "not a valid url",
                value: url
              )

              definitions = [
                input,
                button_label,
                invitation_text,
                action
              ]
              return  { 
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

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
        {a: 11111}
      end


      def self.sheet_view(params)
        @user = params[:user]
        @url = params.dig(:values, :url)
        @conversation_key = params[:conversation_id]
        @message_id = params[:message_id]
        @name = @user[:name]
        @email = @user[:email]

        template = ERB.new <<-EOF
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="ie=edge">
              <title>[Calendly] Widget embed API example</title>
              <style>
              
              body {
                background: url('https://www.toptal.com/designers/subtlepatterns/patterns/restaurant_icons.png');
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;  
                margin: 0px;
              }

              h1 {
                font-size: 50px;
                text-align: center;
              }

              .container {
                margin: 0 auto;
                width: 100%;
              }

              .container p, .container h2 {
                text-align: center;
              }
              
              </style>
            </head>

            <body>
              <div class="container">
                <!-- This Calendly is the DOM element that will contain your embedded typeform -->
                <div class="calendly-inline-widget" 
                  style="min-width:320px;height:580px;" 
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

                    function isCalendlyEvent(e) {
                      return e.data.event &&
                            e.data.event.indexOf('calendly') === 0;
                    };
                    
                    window.addEventListener(
                      'message',
                      function(e) {
                        //console.log("ENENE", e)
                        if (isCalendlyEvent(e) && e.data.event === "calendly.event_scheduled") {
                          window.parent.postMessage({
                            chaskiqMessage: true, 
                            type: "Calendly", 
                            status: "submit",
                            data: e.data
                          }, "*")
                        }
                      }
                    );

                  </script>
                </div>
              
              </div>

            </body>
          </html>
        EOF

        template.result(binding)
      end
    end
  end
end
