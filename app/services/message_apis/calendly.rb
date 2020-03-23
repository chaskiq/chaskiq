# frozen_string_literal: true

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
  
  end
end
