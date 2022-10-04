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
      @package = config[:package]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        "Content-Type" => "application/json"
      }

      # @conn.request :authorization, "Bearer", @api_token
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

    def create_fase_nono(message, klass)
      response = create_meeting

      if response.blank?
        return {
          kind: "initialize",
          definitions: [
            {
              type: "text",
              text: "Something wrong happened when creating the call"
            }
          ],
          values: { whereby_meeting: response }
        }
      end

      definitions = {
        kind: "initialize",
        definitions: [
          {
            type: "content"
          }
        ],
        values: { whereby_meeting: response }
      }
    end

    def url(url)
      "#{@base_url}#{url}?apiKey=#{@api_token}"
    end

    def trigger(event); end

    def process_event(params, package)
      @package = package
      event = params["event"]
      payload = params["payload"]
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
