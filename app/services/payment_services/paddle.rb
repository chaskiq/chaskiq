require 'uri'
require 'net/http'
require 'openssl'

module PaymentServices
  class DataStruct < OpenStruct
    def as_json(*args)
      super.as_json['table']
    end
  end

  class Paddle
    attr_accessor :auth

    def initialize
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
      @auth = {
        vendor_id: ENV['PADDLE_VENDOR_ID'],
        vendor_auth_code: ENV['PADDLE_SECRET_TOKEN']
      }
      self
    end

    def get_plans
      res = get_data(
        url: 'https://vendors.paddle.com/api/2.0/subscription/plans',
        params: auth
      )

      res.filter do |o|
        Plan.all.map do |o|
          o[:id]
        end.include?(o.id)
      end.map do |o|
        o.features = Plan.get_by_id(o.id).dig('features')
        o
      end
    end

    def get_user_transactions(id)
      res = get_data(
        url: "https://vendors.paddle.com/api/2.0/user/#{id}/transactions",
        params: auth
      )
    end

    def get_subscription_transactions(id)
      res = get_data(
        url: "https://vendors.paddle.com/api/2.0/subscription/#{id}/transactions",
        params: auth
      )
    end

    def get_subscription(id)
      return [] if id.nil?

      res = get_data(
        url: 'https://vendors.paddle.com/api/2.0/subscription/users',
        params: auth.merge({
                             subscription_id: id
                           })
      )
    end

    def update_subscription(id, plan_id:, passthrough: nil)
      res = get_data(
        url: 'https://vendors.paddle.com/api/2.0/subscription/users/update',
        params: auth.merge({
                             subscription_id: id,
                             passthrough: passthrough,
                             plan_id: plan_id
                           })
      )
    end

    def get_data(url:, params: {})
      response = @conn.post(url, params) do |req|
        # req.body = params.to_json
      end
      JSON.parse(response.body, object_class: DataStruct).response
    end
  end
end

# frozen_string_literal: true
