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

    def create_fase(block)
            
      response = @conn.post(
        'https://api.zoom.us/v2/users/miguelmichelson@gmail.com/meetings',
        {
          "duration": 20,
          "password": "string",
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
      return nil unless response.success?

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

      #case event
      #when "invitee.created" then handle_created_invitee(payload)
      #when "invitee.canceled" then handle_cancelled_invitee(payload)
      #end
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
      {
        "join_url": data["join_url"],
        "status": data["status"],
        "password": data["password"],
        "meeting_id": data["id"]
      }
    end
  
  end
end
