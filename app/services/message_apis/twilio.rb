# frozen_string_literal: true
module MessageApis
  class Twilio < BasePackage
    include MessageApis::Helpers

    # https://developers.pipedrive.com/docs/api/v1/
    PROVIDER = 'twilio'

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config['api_key']
      @api_token = config['api_secret']
      @phone = config['user_id']

      @url = "https://api.twilio.com/2010-04-01/Accounts/#{@api_key}/Messages.json"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.basic_auth(@api_key, @api_token)

      self
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def process_event(params, package)
      @package = package
      current = params['current']

      case params['SmsStatus']
      when 'read' then process_read(params)
      # when "DELIVERED" then puts("DELIVERED!")
      when 'received' then process_message(params, @package)
        # when "updated" then update_app_user_profile(current)
        # when "deleted" then delete_app_user_profile(params)
      end
    end

    def process_read(params)
      message_id = params['MessageSid']
      conversation_part_channel = ConversationPartChannelSource.find_by(
        message_source_id: message_id
      )
      return if conversation_part_channel.blank?

      conversation_part_channel.conversation_part.read!
    end

    def get_message_id(response_data)
      response_data['sid']
    end

    def send_message(conversation, message)
      blocks = JSON.parse(
        message['serialized_content']
      )['blocks']

      profile_id = conversation.main_participant
                               &.external_profiles
                               &.find_by(provider: PROVIDER)
                               &.profile_id

      # TODO: maybe handle an error here ?
      return if profile_id.blank?

      message_params = process_message_params(blocks, profile_id)

      @conn.post(
        @url,
        message_params
      )
    end

    def process_message_params(blocks, profile_id)
      # TODO: support more blocks
      image_block = blocks.find { |o| o['type'] == 'image' }

      plain_message = blocks.map do |o|
        o['text']
      end.join("\r\n")

      message_params = {
        From: "whatsapp:#{@phone}",
        Body: plain_message,
        To: profile_id
      }

      if image_block
        message_params.merge!({
          MediaUrl: ENV['HOST'] + image_block['data']['url']
        })
      end
    end

    def process_message(params, package)
      @package = package
      app = package.app
      message_id = params['SmsMessageSid']

      # determine the id of the user (channel)
      channel_id, twilio_user, agent_sender = parse_remitent(params)

      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id).present?

      text = params['Body']

      serialized_content = serialize_content(params)

      participant = add_participant(twilio_user)

      add_conversation(
        conversation: conversation,
        agent_sender: agent_sender,
        participant: participant,
        serialized_content: serialized_content,
        text: text,
        message_id: message_id,
        channel_id: channel_id
      )
    end

    def parse_remitent(params)
      cond = params['From'] == "whatsapp:#{@package.user_id.gsub('whatsapp:', '')}"
      channel_id = cond ? params['To'] : params['From']
      twilio_user = cond ? params['To'] : params['From']
      agent_sender = cond
      [channel_id, twilio_user, agent_sender]
    end

    def add_conversation(
      conversation: nil, 
      agent_sender: , 
      participant: , 
      serialized_content:, 
      text:,
      message_id:,
      channel_id:
    )

      if conversation.blank?
        conversation = @package.app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: 'twilio',
            provider_channel_id: channel_id
          ]
        )
      end
      # TODO: serialize message
      conversation.add_message(
        from: agent_sender ? @package.app.agents.first : participant, # agent_required ? Agent.first : participant,
        message: {
          html_content: text,
          serialized_content: serialized_content
        },
        provider: 'twilio',
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
                       'twilio', channel
                     ).first
    end

    def serialize_content(data)
      text = data['Body']

      if data['NumMedia'].to_i > 0
        attachment_block(data)
      else
        text_block(data['Body'])
      end
    end

    def attachment_block(data)
      attachment = data['attachment']

      media_blocks = []

      data['NumMedia'].to_i.times do |num|
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
      text = data['Body']

      case media_type
      when 'image/gif', 'image/jpeg' then photo_block(url: attachment, text: text)
      when 'video/mp4' then gif_block(url: attachment, text: text)
        # TODO: support audio as content block
        # "audio/ogg" then ....
      else file_block(url: attachment, text: "media: #{media_type}")
      end
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
