# frozen_string_literal: true

require "uri"
require "erb"

module MessageApis::Whereby
  class Api < MessageApis::BasePackage
    # https://docs.whereby.com/
    BASE_URL = "https://api.whereby.dev/v1"

    attr_accessor :secret

    def initialize(config:)
      @api_token = config["api_key"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        "Content-Type" => "application/json"
      }

      @conn.request :authorization, "Bearer", @api_token
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
      "#{BASE_URL}#{url}"
    end

    def trigger(event); end

    def process_event(params, package)
      @package = package
      event = params["event"]
      payload = params["payload"]
    end

    def create_meeting
      data = {
        endDate: "2099-02-18T14:23:00.000Z",
        fields: ["hostRoomUrl"]
      }.to_json

      url = url("/meetings")
      response = @conn.post(url, data)
      if response.success?
        JSON.parse(response.body)
      else
        Rails.logger.debug response.body
        nil
      end
    end

    def get_meeting(id)
      url = url("/meetings/#{id}")
      response = @conn.get(url)
      if response.success?
        JSON.parse(response.body)
      else
        Rails.logger.debug response.body
        nil
      end
    end

    def delete_meeting(id)
      url = url("/meetings/#{id}")
      response = @conn.delete(url)
      if response.success?
        response.body
      else
        Rails.logger.debug response.body
        nil
      end
    end
  end
end
