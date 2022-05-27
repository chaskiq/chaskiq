# frozen_string_literal: true

module MessageApis::Twilio
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    # https://developers.pipedrive.com/docs/api/v1/
    PROVIDER = "twilio"

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config["api_key"]
      @api_token = config["api_secret"]
      @phone = config["user_id"]

      @url = "https://api.twilio.com/2010-04-01/Accounts/#{@api_key}/Messages.json"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.request(:basic_auth, @api_key, @api_token)

      self
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def process_event(params, package)
      @package = package
      current = params["current"]

      case params["SmsStatus"]
      when "read" then process_read(params["MessageSid"])
      # when "DELIVERED" then puts("DELIVERED!")
      when "received" then process_message(params, @package)
      when "undelivered" then process_error(params)
        # when "updated" then update_app_user_profile(current)
        # when "deleted" then delete_app_user_profile(params)
      end
    end

    def find_channel_from_part_source(id)
      ConversationPartChannelSource.find_by(
        provider: PROVIDER,
        message_source_id: id
      )
    end

    def process_error(params)
      conversation_part_channel = find_channel_from_part_source(params["SmsSid"])
      # return if conversation_part_channel.blank?

      channel_id, twilio_user, agent_sender = parse_remitent(params)

      conversation = conversation_part_channel.conversation_part.conversation

      # crea el mensaje con el channel de una, asi cuando se cree
      # el notify_message va a bypasear el canal
      # conversation.add_message()
      conversation.add_message_event(
        action: "errored: #{params['SmsStatus']}",
        provider: PROVIDER,
        message_source_id: "bypass-internal-#{params['id']}",
        data: {
          status: params
        }
      )
    end

    def get_message_id(response_data)
      response_data["sid"]
    end

    def prepare_initiator_channel_for(conversation, package)
      @package = package

      profile_id = conversation.main_participant
                                &.external_profiles
                                &.find_by(provider: PROVIDER)
                                &.profile_id

      profile_id = add_participant_to_existing_user(conversation.main_participant, conversation.main_participant.phone) if profile_id.blank?

      raise ActiveRecord::Rollback if profile_id.blank?

      previous_conversation = find_conversation_by_channel(profile_id)

      clear_conversation(previous_conversation) if previous_conversation.present?

      conversation.update(
        conversation_channels_attributes: [
          provider: "twilio",
          provider_channel_id: profile_id
        ]
      )
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json
      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      profile_id = conversation.main_participant
                               &.external_profiles
                               &.find_by(provider: PROVIDER)
                               &.profile_id

      # TODO: maybe handle an error here ?
      return if profile_id.blank?

      message_params = process_message_params(blocks, profile_id)

      response = @conn.post(
        @url,
        message_params
      )

      unless response.success?
        body = begin
          JSON.parse(response.body)
        rescue StandardError
          ""
        end
        msg = begin
          body["message"]
        rescue StandardError
          ""
        end
        conversation.add_message_event(
          action: "errored: #{msg}",
          provider: PROVIDER,
          message_source_id: "bypass-internal-#{part.id}",
          data: {
            status: body
          }
        )
        return nil
      end

      response
    end

    def handle_post_failure; end

    def process_message_params(blocks, profile_id)
      # TODO: support more blocks
      image_block = blocks.find { |o| o["type"] == "image" }

      plain_message = blocks.map do |o|
        o["text"]
      end.join("\r\n")

      message_params = {
        From: "whatsapp:#{@phone}",
        Body: plain_message,
        To: profile_id
      }

      if image_block
        message_params.merge!({
                                MediaUrl: Chaskiq::Config.get("HOST") + image_block["data"]["url"]
                              })
      end

      message_params
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )
      { status: :ok, format: :xml, response: {} }
    end

    def process_message(params, package)
      @package = package
      app = package.app
      message_id = params["SmsMessageSid"]

      # determine the id of the user (channel)
      channel_id, twilio_user, agent_sender = parse_remitent(params)

      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id).present?

      text = params["Body"]

      serialized_content = serialize_content(params)

      participant = add_participant(twilio_user)

      add_conversation(
        conversation:,
        agent_sender:,
        participant:,
        serialized_content:,
        text:,
        message_id:,
        channel_id:
      )

      { status: :ok, format: :xml, response: {}.to_xml }
    end

    def reply_with_alert(params, package); end

    def parse_remitent(params)
      agent_sender = params["From"] == "whatsapp:#{@package.user_id.gsub('whatsapp:', '')}"

      twilio_user = agent_sender ? params["To"] : params["From"]
      channel_id  = agent_sender ? params["To"] : params["From"]
      [channel_id, twilio_user, agent_sender]
    end

    def new_conversation_thread?(from)
      return if from.blank?
      return if new_thread_in_hours.blank?

      from < new_thread_in_hours
    end

    def new_thread_in_hours
      return if @package.settings[:new_conversations_after].blank?

      @package.settings[:new_conversations_after].hours.ago
    end

    def clear_conversation(conversation)
      conversation.conversation_channels.find_by(provider: "twilio").destroy
      conversation.block("Blocked by Whatsapp Twilio")
      conversation.close unless conversation.closed?
      conversation.save
      # TODO: add permament close with reason!
    end

    def add_conversation(
      agent_sender:, participant:, serialized_content:,
      text:, message_id:, channel_id:, conversation: nil
    )

      if conversation.blank? || conversation.closed? || new_conversation_thread?(conversation.latest_user_visible_comment_at)

        clear_conversation(conversation) if conversation.present?

        conversation = @package.app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: "twilio",
            provider_channel_id: channel_id
          ]
        )
      end
      # TODO: serialize message
      conversation.add_message(
        from: agent_sender ? @package.app.agents.first : participant, # agent_required ? Agent.first : participant,
        message: {
          html_content: text,
          serialized_content:
        },
        provider: "twilio",
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
                       "twilio", channel
                     ).first
    end

    def serialize_content(data)
      text = data["Body"]

      if data["NumMedia"].to_i.positive?
        attachment_block(data)
      else
        text_block(data["Body"])
      end
    end

    def attachment_block(data)
      attachment = data["attachment"]

      media_blocks = []

      data["NumMedia"].to_i.times do |num|
        media_blocks << media_block(num, data)
      end

      {
        blocks: media_blocks,
        entityMap: {}
      }.to_json
    end

    def media_block(num, data)
      attachment = data["MediaUrl#{num}"]
      media_type = data["MediaContentType#{num}"]
      text = data["Body"]

      case media_type
      when "image/gif", "image/jpeg" then photo_block(url: attachment, text:)
      when "video/mp4" then gif_block(url: attachment, text:)
        # TODO: support audio as content block
        # "audio/ogg" then ....
      else file_block(url: attachment, text: "media: #{media_type}")
      end
    end

    def add_participant_to_existing_user(app_user, phone)
      twilio_user = "whatsapp:#{phone}"

      app = @package.app

      data = {
        properties: {
          name: twilio_user,
          twilio_id: twilio_user
        }
      }

      external_profile = app.external_profiles.find_by(
        provider: PROVIDER,
        profile_id: twilio_user
      )

      # creates the profile
      if external_profile.blank?
        app_user.external_profiles.create(
          provider: PROVIDER,
          profile_id: twilio_user
        )
        return twilio_user
      end

      participant = external_profile&.app_user
      # means the external profile belongs to somebody else
      return nil if participant && participant.id != app_user.id

      twilio_user if participant && participant.id == app_user.id
    end

    def add_participant(twilio_user)
      app = @package.app
      if twilio_user

        data = {
          properties: {
            name: twilio_user,
            twilio_id: twilio_user
          }
        }

        external_profile = app.external_profiles.find_by(
          provider: PROVIDER,
          profile_id: twilio_user
        )

        participant = external_profile&.app_user

        if participant.blank?
          participant = app.add_anonymous_user(data)
          participant.external_profiles.create(
            provider: PROVIDER,
            profile_id: twilio_user
          )
        end

        participant
      end
    end
  end
end
