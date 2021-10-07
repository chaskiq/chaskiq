# frozen_string_literal: true

require "rack/mime"

module MessageApis::Bootic
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    attr_accessor :access_token, :conn

    URL = "https://api.bootic.net/v1"

    def initialize(config:)
      @package = config[:package]

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        "Content-Type" => "application/json",
        "Accept" => "application/json",
        "Authorization" => "Bearer #{@package.access_token}"
      }

      self
    end

    def url(path)
      "#{URL}/#{path}"
    end

    def test
      @conn.get(URL)
    end

    # https://api.bootic.net/rels/products/
    def get_products
      @conn.get(url("products.json"), { shop_ids: "4138" })
    end

    def get_product(id)
      @conn.get(url("products/#{id}.json"))
    end

    def get_contacts
      @conn.get(url("contacts.json"))
    end

    def create_webhook(attrs = {
      topic: "orders.updated.placed",
      hub_id: 1
    })
      hub_id = attrs[:hub_id]
      attributes = {
        topic: attrs[:topic],
        url: @package.hook_url,
        notify_origin: false
        # "auth": {}
      }
      @conn.post(url("/shops/#{hub_id}/hub"), attributes)
    end

    def register_webhook(app_package, integration); end

    def unregister(app_package, integration)
      # delete_webhooks
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def process_event(params, package)
      @package = package
      current = params["current"]
      process_message(params, @package)
    end

    def send_message(conversation, message)
      # TODO: implement event format
    end
  end
end
