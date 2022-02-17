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
      # TODO: implement event format
    end

    def process_message(params, package)
      data = params[:data]

      case data[:event_type]
      when "message.received"
        # pp data.dig(:payload, :direction)
        process_incoming_message(data)
      end
    end

    def process_incoming_message(data)
      payload = data[:payload]
      channel_id = payload[:messaging_profile_id]
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

      participant = add_participant(payload["from"], PROVIDER)

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

    def send_sms_message(message)
      authorize!

      data = {
        messaging_profile_id: @profile_id,
        to: "+562302305",
        text: "Felisin Sapooo jj"
      }.to_json

      @conn.post(URL, data)
    end
  end
end
