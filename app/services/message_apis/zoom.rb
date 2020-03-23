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

    def create_fase(block, package)
            
      value = block.blocks.dig("values", "src")

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
          "topic": block.conversation_part.key,
          "type": 1
        }.to_json
      )

      puts response.body
      #return nil unless response.success?

      JSON.parse(response.body)
    end

    def trigger(event)
      #binding.pry
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
      message = @package.app.conversation_parts.find_by(
        key: payload["object"]["topic"]
      )
      data = message.messageable.data || {}

      [message, data]
    end

    def handle_started_meeting(payload)
      message, data = find_message(payload)
      message.messageable.save_replied(
        data.merge(status: 'meeting_started')
      )
    end

    def handle_ended_meeting(payload)
      message, data = find_message(payload)      
      message.messageable.save_replied(
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
  
  end
end
