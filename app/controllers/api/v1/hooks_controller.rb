require "open-uri"

class Api::V1::HooksController < ApplicationController

  layout false

  def create
    # get amazon message type and topic
    amz_message_type = request.headers['x-amz-sns-message-type']
    amz_sns_topic = request.headers['x-amz-sns-topic-arn']

    #return unless !amz_sns_topic.nil? &&
    #amz_sns_topic.to_s.downcase == 'arn:aws:sns:us-west-2:867544872691:User_Data_Updates'
    request_body = JSON.parse request.body.read

    # if this is the first time confirmation of subscription, then confirm it
    if amz_message_type.to_s.downcase == 'subscriptionconfirmation'
      send_subscription_confirmation request_body
      render plain: "ok" and return
    end

    process_notification(request_body)
    render plain: "ok" and return
  end

private

  def process_notification(request_body)

    message = parse_body_message(request_body["Message"])

    case message["notificationType"]
    when "Bounce"
      process_bounce(message)
    when "Complaint"
      process_complaint(message)
    end
  end

  def parse_body_message(body)
    JSON.parse(body)
  end

  def process_bounce(m)
    emails = m["bounce"]["bouncedRecipients"].map{|o| o["emailAddress"] }
    source = m["mail"]["source"]
    track_message_for("bounce", m)
  end

  def process_complaint(m)
    emails = m["complaint"]["complainedRecipients"].map{|o| o["emailAddress"] }
    source = m["mail"]["source"]
    track_message_for("spam", m)
  end

  def track_message_for(track_type, m)
    SnsReceiverJob.perform_later(track_type, m, request.remote_ip)
  end

  def send_subscription_confirmation(request_body)
    subscribe_url = request_body['SubscribeURL']
    return nil unless !subscribe_url.to_s.empty? && !subscribe_url.nil?
    subscribe_confirm = open subscribe_url
  end

end
