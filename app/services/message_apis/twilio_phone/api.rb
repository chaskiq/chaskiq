# frozen_string_literal: true

require "rack/mime"

module MessageApis::TwilioPhone
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    attr_accessor :url, :api_key, :conn

    PROVIDER = "TwilioPhone"

    def initialize(config:)
      @package = config[:package]

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

    def register_webhook(app_package, integration); end

    def unregister(app_package, integration)
      # delete_webhooks
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def enqueue_process_event(params, package)
      return process_event(params, package) if params["CallStatus"].present?

      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )
      { status: :ok }
    end

    def process_event(params, package)
      @package = package
      process_message(params, @package)
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json
      nil # nil does not send anything
    end

    def process_message(params, package)
      # call events handler
      return process_incoming_event(params) if params[:StatusCallbackEvent].present?

      # caller initiators

      # for agent
      if params[:Caller] == "client:support_agent"
        conversation = Conversation.find_by(key: params[:name])
        return conference_call(params, conversation, {
                                 message: "Hi, we are connecting you to the conversation now"
                               })
      end

      # for users
      return process_incoming_call(params) if params["CallSid"] && params["CallStatus"]
    end

    def process_incoming_call(payload)
      channel_id = payload[:CallSid]
      phone_number = payload[:Caller]
      app = @package.app

      conversation = nil

      text = "new conversation!"

      serialized_content = text_block(text)
      user_data = {
        "id" => phone_number,
        "first_name" => "twilio:#{phone_number}"
      }

      participant = add_participant(user_data, PROVIDER)

      conversation = find_conversation_by_channel(PROVIDER, phone_number)

      if conversation.blank?
        conversation = app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: PROVIDER,
            provider_channel_id: phone_number
          ]
        )
      end

      # conversation.add_message(
      #   from: participant,
      #   message: {
      #     html_content: text,
      #     serialized_content: serialized_content
      #   },
      #   provider: PROVIDER,
      #   message_source_id: channel_id, # usar conversation_key=?
      #   check_assignment_rules: true
      # )

      author = app.agents.first

      controls = {
        app_package: "TwilioPhone",
        schema: [
          {
            type: "content"
          }
        ],
        type: "app_package",
        wait_for_input: true
      }

      conversation.add_message(
        from: author,
        controls: controls
      )

      conference_call(payload, conversation, {
                        message: "Thanks for calling to Chaskiq!"
                      })
    end

    def process_incoming_event(payload)
      # TODO: serialize message
      conversation = @package.app.conversations.find_by(key: payload["FriendlyName"])

      # return if conversation && conversation.conversation_part_channel_sources
      #                                      .find_by(message_source_id: channel_id.to_s).present?

      conversation.add_message_event(
        action: payload["StatusCallbackEvent"],
        provider: PROVIDER,
        message_source_id: "bypass-internal-#{payload['CallSid']}-#{payload['SequenceNumber']}",
        data: {
          status: payload["StatusCallbackEvent"]
        }
      )

      conversation.conversation_parts_events

      # conversation.events.create(
      #  action: "plugins.twilio_phone",
      #  properties: {
      #    label: payload["text"],
      #    value: payload["StatusCallbackEvent"],
      #    comment: "nada aun"
      #  }
      # )
    end

    def conference_call(params, conversation, opts)
      response = Twilio::TwiML::VoiceResponse.new
      response.say(message: opts[:message]) if opts[:message].present?
      # response.say(message: 'other message here')

      response.dial do |dial|
        name = conversation.key

        dial.conference(name,
                        beep: false,
                        end_conference_on_exit: true,
                        statusCallback: @package.hook_url.gsub("http://localhost:3000", "https://chaskiq.ngrok.io"),
                        statusCallbackEvent: "start end join leave mute hold")
      end

      { format: :xml, response: response }
    end
  end
end
