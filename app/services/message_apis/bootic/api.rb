# frozen_string_literal: true

require "rack/mime"
require "oauth2"

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

    # https://api.bootic.net/rels/products/
    def get_token
      client = OAuth2::Client.new(
        @package.settings[:client_id],
        @package.settings[:client_secret],
        site: "https://auth.bootic.net"
      )

      access_token = client.client_credentials
                           .get_token({ "scope" => "public,admin" }, "auth_scheme" => "basic", "scope" => "public,admin")

      token = access_token.token
      @package.update(access_token: token) if token.present?
      token
    end

    def handle_req(meth, uri, params)
      response = @conn.send(meth, uri, params)
      if response.status == 401
        get_token
        return @conn.send(meth.to_sym, uri, params)
      end
      response
    end

    def connection_get(uri:, params: nil)
      handle_req(:get, uri, params)
    end

    def connection_post(uri:, params: nil)
      handle_req(:post, uri, params)
    end

    # rubocop:disable Naming/MethodParameterName
    def get_products(q:)
      connection_get(uri: url("products.json"), params: { shop_ids: "4138", q: q })
    end
    # rubocop:enable Naming/MethodParameterName

    def get_product(id)
      connection_get(uri: url("products/#{id}.json"), params: { shop_ids: "4138" })
    end

    def get_orders
      connection_get(uri: url("shops/4138/orders.json"))
    end

    def get_order(id)
      connection_get(uri: url("shops/4138/orders/#{id}"))
    end

    def get_contacts
      connection_get(uri: url("contacts.json"))
    end

    def get_hub(id)
      connection_get(uri: url("hub/#{id}"))
    end
  end
end
