# frozen_string_literal: true

require "uri"
require "erb"

module MessageApis::Cal
  class Api < MessageApis::BasePackage
    # https://developer.cal.com/api

    attr_accessor :secret

    def initialize(config:)
      @api_token = config["api_key"]
      @base_url = config["url"].presence || "https://api.cal.com/api/v1"
      @key = config["key"]
      @package = config[:package]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        "Content-Type" => "application/json"
      }
    end

    def after_install
      data = {
        id: "ChaskiqHook-#{SecureRandom.hex}",
        eventTriggers: ["BOOKING_CREATED"], # , "BOOKING_RESCHEDULED"] # "BOOKING_CANCELLED"],
        subscriberUrl: @package.hook_url,
        active: true
      }

      delete_webhook(@package.settings["hook_id"]) if @package.settings["hook_id"].present?

      if (body = create_webhook(data)) && body.present?
        hook_id = body["webhook"]["id"]
        @package.update(settings: @package.settings.merge({ "hook_id" => hook_id }))
      end
    end

    def url(url)
      key_part = "&key=#{@key}"
      "#{@base_url}#{url}?apiKey=#{@api_token}#{key_part}"
    end

    def trigger(event); end

    def process_event(params, package)
      @package = package
      event = params["event"]
      payload = params["payload"]

      case payload["status"]
      when "ACCEPTED"
        process_accepted_event(payload) if params["triggerEvent"] == "BOOKING_CREATED"
      end
    end

    def process_accepted_event(payload)
      message = @package.app.conversation_parts.find_by(
        id: payload["metadata"]["mid"]
      )

      definitions = [
        {
          type: "text",
          text: "Scheduled #{payload['title']}",
          align: "center",
          style: "header"
        },
        {
          type: "text",
          text: payload["startTime"],
          align: "center"
        },
        {
          type: "text",
          text: payload["endTime"],
          align: "center"
        }
      ]

      schema = {
        kind: "submit",
        definitions: definitions,
        results: {}
      }

      m = message.message
      blocks = m.blocks.merge("schema" => definitions)
      m.blocks = blocks
      m.save_replied(m.data.merge({ "payload" => payload }))
    end

    def event_type(id)
      url = url("/event-types/#{id}")
      response = @conn.get(url)
      if response.success?
        JSON.parse(response.body)
      else
        Rails.logger.debug response.body
        response
      end
    end

    def event_types
      response = @conn.get(url("/event-types"))
      if response.success?
        JSON.parse(response.body)["event_types"]
      else
        Rails.logger.debug response.body
        nil
      end
    end

    def create_webhook(data)
      response = @conn.post(url("/hooks"), data.to_json)
      if response.success?
        JSON.parse(response.body)
      else
        Rails.logger.debug response.body
        nil
      end
    end

    def delete_webhook(id)
      response = @conn.delete(url("/hooks/#{id}"))
      if response.success?
        JSON.parse(response.body)
      else
        Rails.logger.debug response.body
        nil
      end
    end
  end
end
