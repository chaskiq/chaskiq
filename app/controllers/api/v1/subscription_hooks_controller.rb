require "base64"
require "php_serialize"
require "openssl"

class Api::V1::SubscriptionHooksController < ApplicationController
  before_action :verify_key

  def create
    @app = App.find_by(key: params["passthrough"])
    render plain: "OK" and return if @app.blank?

    process_event
    render plain: "OK"
  end

  private

  def process_event
    case params["alert_name"]
    when "subscription_created" then subscription_created
    when "subscription_cancelled" then subscription_cancelled
    when "subscription_updated" then subscription_updated
    else
      Rails.logger.info("no handler for #{params['alert_name']}")
    end
  end

  def subscription_created
    update_app_subscription
    notify_subscription
    # TODO: notify something
  end

  def subscription_cancelled
    update_app_subscription
    notify_subscription
    # TODO: notify something
  end

  def subscription_updated
    update_app_subscription
    notify_subscription
    # TODO: notify something
  end

  def update_app_subscription
    @app.update(
      paddle_subscription_id: params["subscription_id"],
      paddle_subscription_plan_id: params["subscription_plan_id"],
      paddle_user_id: params["user_id"],
      paddle_subscription_status: params["status"]
    )
  end

  def notify_subscription
    EventsChannel.broadcast_to(@app.key,
                               {
                                 type: "paddle:subscription",
                                 data: params
                               }.as_json)
  end

  def verify_key
    public_key = Chaskiq::Config.get("PADDLE_PUBLIC_KEY")

    data = params.permit!.to_h.dup

    # 'data' represents all of the POST fields sent with the request.
    # Get the p_signature parameter & base64 decode it.
    signature = Base64.decode64(data["p_signature"])

    # Remove the p_signature parameter
    data.delete("p_signature")
    data.delete("controller")
    data.delete("action")

    # Ensure all the data fields are strings
    data.each { |key, value| data[key] = String(value) }

    # Sort the data
    data_sorted = data.sort_by { |key, _value| key }

    # and serialize the fields
    # serialization library is available here: https://github.com/jqr/php-serialize
    data_serialized = PHP.serialize(data_sorted, true)

    # verify the data
    digest    = OpenSSL::Digest.new("SHA1")
    pub_key   = OpenSSL::PKey::RSA.new(public_key).public_key
    verified  = pub_key.verify(digest, signature, data_serialized)

    raise "not verified signature" unless verified
  end
end
