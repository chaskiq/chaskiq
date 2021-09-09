# frozen_string_literal: true

module MessageApis::Messenger
  class Api < MessageApis::BasePackage
    BASE_URL = "https://graph.facebook.com/v2.6"
    PROVIDER = "messenger"
    include MessageApis::Helpers

    attr_accessor :url, :access_token, :conn

    def initialize(config:)
      @api_token = config["access_token"]

      @url = "#{BASE_URL}/me/messages?access_token=#{@api_token}"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      self
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def response_with_text?
      true
    end

    def create_hook_from_params(params, package)
      token = params["hub.verify_token"]
      mode = params["hub.mode"]
      challenge = params["hub.challenge"]
      verify_token = package.settings["verify_token"]
      # Checks if a token and mode is in the query string of the request
      return if !mode && !token
      # Checks the mode and token sent is correct
      # Responds with the challenge token from the request
      return challenge if mode === "subscribe" && token === verify_token

      # Responds with '403 Forbidden' if verify tokens do not match
      nil
    end

    def enqueue_process_event(params, package)
      return process_event(params, package) if params["hub.verify_token"].present?

      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )
      { status: :ok }
    end

    def process_event(params, package)
      @package = package
      current = params["current"]

      return create_hook_from_params(params, package) if params["hub.verify_token"].present? && params["hub.mode"] == "subscribe"

      process_message(params, @package) if params["object"] == "page" && params["entry"].present?
    end

    def get_message_id(response_data)
      response_data["message_id"]
    end

    def send_message(conversation, message)
      provider_channel_id = conversation.conversation_channels
                                        .find_by(provider: PROVIDER)
                                        .provider_channel_id

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      plain_message = blocks.map do |o|
        o["text"]
      end.join("\r\n")

      request_body = {
        recipient: {
          id: provider_channel_id
        },
        message: { text: plain_message },
        messaging_type: "MESSAGE_TAG",
        tag: "ACCOUNT_UPDATE"
      }

      @conn.post(
        @url,
        request_body.to_json,
        "Content-Type" => "application/json"
      )
    end

    def process_read(conversation, entry, sender_id); end

    def process_message(params, package)
      @package = package

      message = params["entry"].first["messaging"].first

      return unless message.keys.include?("message")

      channel_id, messenger_user, agent_sender = determine_channel(message)

      conversation = find_conversation_by_channel(channel_id)

      message_id = message["message"]["mid"]

      return if present_conversation?(conversation, message_id)

      serialized_content = serialize_content(message)

      return if serialized_content.blank?

      participant = add_participant(messenger_user)

      add_message(
        conversation: conversation,
        participant: participant,
        serialized_content: serialized_content,
        text: message["message"]["text"],
        message_id: message_id,
        from: agent_or_participant(agent_sender, participant),
        channel_id: channel_id
      )
    end

    def agent_or_participant(agent_sender, participant)
      agent_sender ? @package.app.agents.first : participant
    end

    def present_conversation?(conversation, message_id)
      conversation && conversation.conversation_part_channel_sources
                                  .find_by(message_source_id: message_id)
                                  .present?
    end

    def determine_channel(message)
      sender = message["sender"]["id"]
      target = message["recipient"]["id"]
      # determine the id of the user (channel)
      cond = message["message"]["is_echo"]
      channel_id = cond ? target : sender
      messenger_user = cond ? target : sender
      agent_sender = cond
      [channel_id, messenger_user, agent_sender]
    end

    def add_message(from:, conversation:, participant:,
                    serialized_content:, text:, message_id:, channel_id:)
      if conversation.blank?
        conversation = @package.app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: PROVIDER,
            provider_channel_id: channel_id
          ]
        )
      end

      conversation.add_message(
        from: from,
        message: {
          html_content: text,
          serialized_content: serialized_content
        },
        provider: PROVIDER,
        message_source_id: message_id,
        check_assignment_rules: true
      )
    end

    def find_conversation_by_channel(channel)
      conversation = @package
                     .app
                     .conversations
                     .joins(:conversation_channels)
                     .where(
                       "conversation_channels.provider =? AND
                          conversation_channels.provider_channel_id =?",
                       "messenger", channel
                     ).first
    end

    def serialize_content(data)
      text = data["message"]["text"]
      if data["message"].keys.include?("attachments")
        attachment_block(data)
      else
        text_block(text)
      end
    end

    def attachment_block(data)
      attachments = data["message"]["attachments"]

      media_blocks = []

      attachments.each do |attachment|
        media_blocks << media_block(attachment)
      end

      {
        blocks: media_blocks,
        entityMap: {}
      }.to_json
    end

    def media_block(attachment)
      # attachment = data["MediaUrl#{num}"]
      # media_type = data["MediaContentType#{num}"]
      # text = data["Body"]
      case attachment["type"]
      when "image" then photo_block(url: attachment["payload"]["url"], text: "")
        # when "image/jpeg" then photo_block(attachment, text)
      end
    end

    def get_fb_profile(id)
      # curl -X GET "https://graph.facebook.com/<PSID>?fields=first_name,last_name,profile_pic&access_token=<PAGE_ACCESS_TOKEN>"
      url = "https://graph.facebook.com/#{id}?fields=first_name,last_name,profile_pic&access_token=#{@api_token}"
      response = @conn.get(
        url,
        "Content-Type" => "application/json"
      )
      JSON.parse(response.body)
    end

    def add_participant(messenger_user)
      app = @package.app

      if messenger_user

        external_profile = app.external_profiles.find_by(
          provider: PROVIDER,
          profile_id: messenger_user
        )

        participant = external_profile&.app_user

        participant, data = handle_participant(participant, messenger_user)

        participant = app.add_anonymous_user(data) if participant.blank?

        participant
      end
    end

    def handle_participant(participant, messenger_user)
      return [participant, nil] if participant.present?

      profile_data = get_fb_profile(messenger_user)

      if profile_data.keys.include?("first_name")
        name = "#{profile_data['first_name']} #{profile_data['last_name']}"
        profile_data.merge!(name: name)

        data = {
          name: "#{profile_data['first_name']} #{profile_data['last_name']}"
        }.merge!(profile_data.except("id"))
      end

      participant = @package.app.add_anonymous_user(data)
      participant.external_profiles.create(
        provider: PROVIDER,
        profile_id: profile_data["id"]
      )

      [participant, data]
    end
  end
end
