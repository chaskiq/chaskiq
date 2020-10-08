# frozen_string_literal: true

module MessageApis
  class Zoom
    # https://marketplace.zoom.us/
    BASE_URL = 'https://api.zoom.us/v2'

    attr_accessor :secret

    def initialize(config:)
      @secret = secret

      @api_token = config["access_token"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = { 
        'X-TOKEN' => @api_token, 
        'Content-Type'=> 'application/json',
        'Authorization' => "Bearer #{@api_token}"
      }

    end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def create_fase(message, klass)
      value = message.blocks.dig("values", "email")
      #value = user_value

      response = @conn.post(
        "https://api.zoom.us/v2/users/#{value}/meetings",
        {
          "duration": 20,
          "password": DummyName::Name.new,
          "settings": {
            "audio": true,
            "host_video": true,
            "join_before_host": false,
            "enforce_login": false,
            "mute_upon_entry": false,
            "participant_video": true
          },
          "timezone": "string",
          "topic": message.conversation_part.key,
          "type": 1
        }.to_json
      )

      json = JSON.parse(response.body)
      #return nil unless response.success?

      definitions = [
        {
          "type":  "text",
          "style": "header",
          "text":  "Your zoom meeting is ready",
          "align": "left"
        },
        {
          "type":  "text",
          "text":  "pass: #{json['password']}",
          "align": "left",
        },
        {
          "type":  "button",
          "align": "left",
          "label": 'Join',
          "width": "full",
          "action": {
            type: 'url',
            url: json['join_url']
          }
        },
        {
          "type":  "text",
          "text":  "Status: #{json['status']}",
          "align": "left"
        }
      ]

      return { 
        kind: 'initialize', 
        definitions: definitions,
        values: {
          email: value,
        }
        #results: params[:ctx][:values]
      }
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

      # https://marketplace.zoom.us/docs/api-reference/webhook-reference/meeting-events/meeting-ending
      case event
      when "meeting.started" then handle_started_meeting(payload)
      when "meeting.ended" then handle_ended_meeting(payload)
      end
    end

    def find_message(payload)
      #TODO: validate app match from message
      message = @package.app.conversation_parts.find_by(
        key: payload["object"]["topic"]
      )
      data = message.messageable.data || {}

      [message, data]
    end

    def handle_started_meeting(payload)
      message, data = find_message(payload)
      m = message.messageable
      schema = m.blocks["schema"].dup
      last_block = schema.pop
      new_schema = schema << last_block.merge(text: 'meeting_started')
      m.blocks["schema"] = new_schema
      m.save_replied(
        data.merge(status: 'meeting_started')
      )
    end

    def handle_ended_meeting(payload)
      message, data = find_message(payload)
      m = message.messageable

      schema = m.blocks["schema"].dup
      last_block = schema.pop
      new_schema = schema << last_block.merge(text: 'meeting_ended')
      m.blocks["schema"] = new_schema
      m.save_replied(
        data.merge(status: 'meeting_ended')
      )
    end

    def register_webhook(app_package, integration)
      
    end

    # for display in replied message
    def self.display_data(data)
      return if data.blank?

      return {
              'formatted_text': data['message']
             } if data['message'].present?

      {
        "opener": data["join_url"],
        "status": data["status"],
        "password": data["password"],
        "meeting_id": data["id"], 
        "formatted_text": "<span>
          <a href=#{data["join_url"]} target='blank'> Zoom meeting: #{data['id']}</a> 
          <br/> password: #{data["password"]}
          <br/> status: #{data["status"]}
          </span>
        "
      }
    end

    class PresenterManager

      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
      def self.initialize_hook(params)

        url = params[:ctx][:values][:email]

        definitions = [
          {
            "type":  "text",
            "style": "header",
            "text":  "Your zoom meeting is ready",
            "align": "left"
          },
          {
            "type":  "text",
            "text":  "pass: #{params[:ctx][:values][:password]}",
            "align": "left",
          },
          {
            "type":  "button",
            "align": "left",
            "label": 'Join',
            "width": "full",
            "action": {
              type: 'url',
              url: params[:ctx][:values][:join_url]
            }
          },
          {
            "type":  "text",
            "text":  "Status: #{params[:ctx][:values][:status]}",
            "align": "left"
          }
        ]

        { 
          kind: 'initialize', 
          definitions: definitions,
          values: {
            email: params.dig(:ctx, :values, :email),
          }
          #results: params[:ctx][:values]
        }
      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
      def self.submit_hook(params)
        []
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
      def self.configure_hook(kind: , ctx:)
          zoom_input = {
            type: 'input',
            id: 'zoom_user',
            placeholder: 'enter your zoom user email',
            label: 'Zoom user',
          }

          action = {
            name: 'set_url',
            label: 'Set up',
            type: 'button',
            action: {
              type: "submit" 
            }
          }

          definitions = [
            zoom_input,
            action
          ]
          
          if ctx.dig(:field, :name) == "set_url" && 
            ctx.dig(:field, :action, :type) === "submit"

            email = ctx.dig(:values, :zoom_user)

            if email.blank?
              input = zoom_input
              input.merge!(
                errors: "not a valid url",
                value: email
              )

              definitions = [
                input,
                action
              ]
              return  { 
                kind: kind, 
                definitions: definitions 
              }
            end

            #pkg = ctx[:app].app_package_integrations.joins(:app_package).find_by("app_packages.name": "Zoom")

            #response = pkg.message_api_klass.create_fase(
            #  email
            #)
            
            #if response["id"].present?
            if true
              return { 
                kind: 'initialize', 
                definitions: definitions,
                results: { 
                  email: email,
                  #join_url: response["join_url"],
                  #password: response["password"],
                  #status: response["status"],
                  #zoom_id: response["id"]
                }
              }
            else 

              error_definitions = [{
                type: 'text',
                text: 'There was an error creating the ZOOM metting',
                style: 'header'
              },
              {
                type: 'text',
                text: response["message"],
                style: 'muted'
              },
              {
                name: 'a',
                label: 'a separator',
                action: {},
                type: 'separator'
              }]

              return { 
                kind: kind, 
                definitions: error_definitions + definitions,
              }
            end

          end

          { kind: kind, ctx: ctx, definitions: definitions }
          
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
      end

      def self.sheet_view(params)
      end
    end
  
  end
end
