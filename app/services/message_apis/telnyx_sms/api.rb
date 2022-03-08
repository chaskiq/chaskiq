# frozen_string_literal: true

require "rack/mime"

module MessageApis::TelnyxSms
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    attr_accessor :url, :api_key, :conn

    # URL = "https://api.telnyx.com/v2/messaging"
    URL = "https://api.telnyx.com/v2/messages"
    PROVIDER = "TelnyxSms"

    def initialize(config:)
      @package = config[:package]
      @api_key = config[:api_key]
      @profile_id = config[:profile_id]

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }

      self
    end

    def authorize!
      @conn.authorization :Bearer, @api_key
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
      return nil if message["serialized_content"].blank?

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      image_block = blocks.find { |o| o["type"] == "image" }
      video_block = blocks.find { |o| o["type"] == "recorded-video" }
      file_block = blocks.find { |o| o["type"] == "file" }
      is_plain = !image_block || !video_block || !file_block
      plain_message = blocks.map do |o|
        o["text"]
      end.join("\r\n")

      channel = conversation.conversation_channels.find_by(provider: PROVIDER)

      return if channel.blank?

      send_sms_message(channel.provider_channel_id, plain_message)
    end

    def get_message_id(response_data)
      # puts "••••••• #{response_data}"
      response_data.dig("data", "id")
    end

    def process_message(params, package)
      data = params[:data]

      case data[:event_type]
      when "message.received"
        # pp data.dig(:payload, :direction)
        process_incoming_message(data)
      when "message.finalized"
        process_read(data[:payload][:id])
      end
    end

    def process_incoming_message(data)
      payload = data[:payload]
      channel_id = payload[:from][:phone_number]
      message_id = payload[:id]
      sender_id = payload[:from][:phone_number]
      app = @package.app

      conversation = find_conversation_by_channel(PROVIDER, channel_id.to_s)

      return if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id.to_s).present?

      text = payload["text"]

      serialized_content = text_block(text)

      user_data = {
        id: payload[:from][:phone_number]
      }

      participant = add_participant(user_data, PROVIDER)

      if conversation.blank?
        conversation = app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: PROVIDER,
            provider_channel_id: channel_id
          ]
        )
      end

      # TODO: serialize message
      conversation.add_message(
        from: participant,
        message: {
          html_content: text,
          serialized_content: serialized_content
        },
        provider: PROVIDER,
        message_source_id: message_id,
        check_assignment_rules: true
      )
    end

    def send_sms_message(channel_id, message)
      # puts "channel #{channel_id}"
      authorize!

      phone = resolve_outbound_phone(channel_id)

      # puts "outgoing #{phone}, #{channel_id}"

      data = {
        to: "+#{channel_id}",
        text: message
      }

      data.merge!(resolve_outbound_phone(phone))

      data.to_json

      @conn.post(URL, data)
    end

    def resolve_outbound_phone(phone)
      phone.gsub!("+", "")
      key = get_phones_data.keys.find { |o| phone.starts_with?(o) }
      case key
      when nil
        { messaging_profile_id: @profile_id }
      else
        { from: phones_data[key]&.sample&.gsub("-", "") }
      end
    end

    def phones_data
      @phones_data ||= get_phones_data
    end

    def get_phones_data
      data = {}
      phones = @package.settings["phones"] || ""
      phones.split(",").each do |o|
        code = o.split("-").first.gsub("+", "")
        data[code].present? ? data[code] << o : data[code] = [o]
      end
      @phones_data = data
    end
  end
end