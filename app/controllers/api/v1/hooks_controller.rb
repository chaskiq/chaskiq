# frozen_string_literal: true

require 'open-uri'

class Api::V1::HooksController < ActionController::API
  include MessageApis::Helpers
  include ActionView::Helpers::SanitizeHelper

  def create
    # get amazon message type and topic
    amz_message_type = request.headers['x-amz-sns-message-type']
    amz_sns_topic = request.headers['x-amz-sns-topic-arn']

    # return unless !amz_sns_topic.nil? &&
    # amz_sns_topic.to_s.downcase == 'arn:aws:sns:us-west-2:867544872691:User_Data_Updates'
    request_body = JSON.parse request.body.read
    # if this is the first time confirmation of subscription, then confirm it
    if amz_message_type.to_s.downcase == 'subscriptionconfirmation' || request_body['notificationType'] === 'AmazonSnsSubscriptionSucceeded'
      send_subscription_confirmation request_body
      render(plain: 'ok') && return
    end

    if is_notification_message?(request_body)

      if request_body['Subject'] == 'Amazon SES Email Receipt Notification'
        process_email_notification(request_body['Message'])
        render(plain: 'ok') && return
      end

      if request_body['Message'] == 'Successfully validated SNS topic for Amazon SES event publishing.'
        render(plain: 'ok') && return
      else
        process_event_notification(request_body)
        render(plain: 'ok') && return
      end
    end

    # process_notification(request_body)
    render(plain: 'ok') && return
  end

  private

  def is_notification_message?(request_body)
    amz_message_type = request.headers['x-amz-sns-message-type']
    (amz_message_type == 'Notification') || (request_body['Type'] == 'Notification')
  end

  # TODO: add some tests mdfk!

  def process_email_notification(message)
    json_message = JSON.parse(message)
    json_message['receipt']
    json_message['mail']['headers'].map { |o| { o['name'] => o['value'] } }

    json_message['receipt']['action']

    #=> {"type"=>"S3",
    # "topicArn"=>"xxxx",
    # "bucketName"=>"xxxx-incoming-mails",
    # "objectKeyPrefix"=>"mail",
    # "objectKey"=>"mail/xxxxx"}
    action = json_message['receipt']['action']

    mail_body = read_mail_file(action)
    mail       = Mail.read_from_string(mail_body)
    from       = mail.from
    to         = mail.to
    recipients = mail.recipients # ["messages+aaa@hermessenger.com"] de aqui sale el app y el mensaje!

    message = EmailReplyParser.parse_reply(mail.text_part.body.to_s).gsub("\n", '<br/>').force_encoding(Encoding::UTF_8)
    #  mail.parts.last.body.to_s )
    recipient_parts = URLcrypt.decode(recipients.first.split('@').first.split('+').last)

    app, conversation = find_resources_in_recipient_parts(recipient_parts)

    messageId = json_message['mail']['messageId']

    # this logic implies that if the email.from correspond to an agent , then we assume that the message is from agent
    from = find_remitent(app: app, from: from)

    # TODO: handle blank author with a conversation.add_message_event
    # to notify that the email was not delivered, which is the mos probable case
    # but whe should inspect the status of this

    # we have found notification like this:
    #  ""An error occurred while trying to deliver the mail to the following recipients:<br/>miguel@chaskiq.io""

    # for now just skip the message
    return if from.blank?

    message = process_attachments(mail, message)

    serialized_content = begin
      serialize_content(message)
    rescue StandardError
      nil
    end

    opts = {
      from: from,
      message: {
        serialized_content: serialized_content,
        html_content: message
      },
      email_message_id: mail.message_id
    }

    conversation.add_message(opts)
  end

  def process_attachments(mail, message)
    mail.attachments.each do |attachment|
      next unless attachment.content_type.start_with?('image/')

      uploaded_data = direct_upload(attachment)
      attachment_string_pattern = "[image: #{attachment.filename}]"
      image_mark = "<img src='#{uploaded_data[:url]}' title='#{attachment.filename}' width='#{uploaded_data[:width]}' height='#{uploaded_data[:height]}' />"

      # replace for inline attachments or append for attachments
      if message.include?(attachment_string_pattern)
        message.gsub!(
          attachment_string_pattern,
          image_mark
        )
      else
        message = image_mark.dup << message
      end
    end
    message
  end

  def process_event_notification(request_body)
    message = parse_body_message(request_body['Message'])
    return if message.blank?
    return if message['eventType'].blank?

    track_message_for(message['eventType'].downcase, message)
  end

  def parse_body_message(body)
    JSON.parse(body)
  rescue StandardError
    nil
  end

  def track_message_for(track_type, m)
    SnsReceiverJob.perform_later(track_type, m, request.remote_ip)
  end

  def send_subscription_confirmation(request_body)
    subscribe_url = request_body['SubscribeURL']
    return nil unless !subscribe_url.to_s.empty? && !subscribe_url.nil?

    open subscribe_url
  end

  def find_resources_in_recipient_parts(recipient_parts)
    app_id, conversation_id = recipient_parts.split('+')
    app = App.find(app_id)
    conversation = app.conversations.find(conversation_id)
    [app, conversation]
  end

  def read_mail_file(action)
    file = AWS_CLIENT.get_object(
      bucket: action['bucketName'],
      key: action['objectKey']
    )
    file.body.read
  end

  def direct_upload(attachment)
    file = StringIO.new(attachment.decoded)
    blob = ActiveStorage::Blob.create_after_upload!(
      io: file,
      filename: attachment.filename,
      content_type: attachment.mime_type
    )
    {
      url: Rails.application.routes.url_helpers.rails_blob_path(blob)
    }.merge!(ActiveStorage::Analyzer::ImageAnalyzer.new(blob).metadata)
  end

  def find_remitent(app:, from:)
    app.agents.find_by(email: from.first) || app.app_users.find_by(email: from.first)
  end

  def serialize_content(message)
    message = sanitize(message, tags: %W[p br img \n])
    doc = Nokogiri::HTML.parse(message)

    doc.css('br').each do |node|
      node.replace(Nokogiri::XML::Text.new("\n", doc))
    end

    lines = doc.css('body').inner_html.gsub(%r{<p>|</p>}, '')
    lines = lines.split("\n").delete_if(&:empty?)

    {
      "blocks": lines.map do |o|
        if o.include?('<img src=')
          process_image(o)
        else
          serialized_block(o)
        end
      end,
      "entityMap": {}
    }.to_json
  end

  def process_image(o)
    img = Nokogiri::HTML.parse(o).css('img')
    url = img.attr('src')&.value
    w = img.attr('width')&.value
    h = img.attr('height')&.value
    title = img.attr('title')&.value
    photo_block(url: url, title: title, w: w, h: h)
  end
end
