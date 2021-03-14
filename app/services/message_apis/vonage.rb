# frozen_string_literal: true

module MessageApis
  class Vonage < BasePackage
    include MessageApis::Helpers
    PROVIDER = 'vonage'

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config['api_key']
      @api_token = config['api_secret']
      @phone = config['user_id']

      @url = if true # config["sandbox"]
               'https://messages-sandbox.nexmo.com/v0.1/messages'
             else
               'https://api.nexmo.com/v0.1/messages'
             end

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        'X-TOKEN' => @api_token,
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
      }

      @conn.basic_auth(@api_key, @api_token)

      self
    end

    def trigger(event)
    end

    def process_event(params, package)
      @package = package
      current = params['current']

      if params['status'].present?
        case params['status']
        when 'read'
          process_read(params)
          return
        else
          return
        end
      end

      process_message(params, @package)
    end

    def process_read(params)
      message_id = params['message_uuid']
      conversation_part_channel = ConversationPartChannelSource.find_by(
        provider: PROVIDER,
        message_source_id: message_id
      )
      return if conversation_part_channel.blank?

      conversation_part_channel.conversation_part.read!
    end

    def get_message_id(response_data)
      response_data['message_uuid']
    end

    def send_message(conversation, message)
      blocks = JSON.parse(
        message['serialized_content']
      )['blocks']

      plain_message = blocks.map do |o|
        o['text']
      end.join("\r\n")

      profile_id = conversation.main_participant
                               &.external_profiles
                               &.find_by(provider: PROVIDER)
                               &.profile_id

      # TODO: maybe handle an error here ?
      return if profile_id.blank?

      message_params = build_message_params(
        blocks: blocks, 
        plain_message: plain_message,
        plain_id: profile_id
      )

      s = @conn.post(
        @url,
        message_params.to_json
      )
    end

    def build_message_params(blocks:, plain_message:, profile_id:)
      # TODO: support more blocks
      image_block = blocks.find { |o| o['type'] == 'image' }
      video_block = blocks.find { |o| o['type'] == 'recorded-video' }
      file_block = blocks.find { |o| o['type'] == 'file' }

      message_params = {
        from: { type: 'whatsapp', number: @phone },
        to: { type: 'whatsapp', number: profile_id },
        message: {
          content: { type: 'text', text: plain_message }
        }
      }

      if image_block
        message_params.merge!(
          vonage_block(block_type: 'image', plain_message: plain_message , block: image_block)
        )
      end

      if video_block
        message_params.merge!(
          vonage_block(block_type: 'video', plain_message: plain_message , block: video_block)
        )
      end

      if file_block
        message_params.merge!(
          vonage_block(block_type: 'file', plain_message: plain_message , block: file_block)
        )
      end
    end

    def vonage_block(block_type: , plain_message: , block:)
      {
        message: {
          content: {
            type: block_type,
            "#{block_type}": {
              url: ENV['HOST'] + block['data']['url'],
              caption: plain_message
            }
          }
        }
      }
    end

    def process_message(params, package)
      @package = package

      app = package.app

      message_id = params['message_uuid']

      channel_id, vonage_user, agent_sender = get_channel_data(params)
      
      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id).present?

      text = params.dig('message', 'content', 'text')

      serialized_content = serialize_content(params)

      participant = add_participant(vonage_user)

      add_message(
        conversation: conversation, 
        participant: participant, 
        channel_id: channel_id, 
        from: agent_sender ? @package.app.agents.first : participant, 
        serialized_content: serialized_content,
        text: text,
        message_id: message_id
      )
    end

    def get_channel_data(params)
      sender_id = params['from']['number']
      target_id = params['to']['number']
      # determine the id of the user (channel)
      cond = sender_id == @package.user_id.to_s
      channel_id = cond ? target_id : sender_id
      vonage_user = cond ? target_id : sender_id
      agent_sender = cond
      [channel_id, vonage_user, agent_sender]
    end

    def add_message(
      conversation:, 
      participant:, 
      channel_id:, 
      from:, 
      serialized_content:,
      text:,
      message_id:
    )
      if conversation.blank?
        conversation = @package.app.conversations.create(
          main_participant: participant,
          conversation_channels_attributes: [
            provider: PROVIDER,
            provider_channel_id: channel_id
          ]
        )
      end

      # TODO: serialize message
      conversation.add_message(
        from: from, # agent_required ? Agent.first : participant,
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
                       PROVIDER, channel
                     ).first
    end

    def serialize_content(data)
      text = data.dig('message', 'content', 'text')
      if data.dig('message', 'content', 'type') == 'text'
        text_block(text) if text.present?
      else
        attachment_block(data)
      end
    end

    def attachment_block(data)
      image_data = data.dig('message', 'content')
      {
        blocks: [media_block(image_data)],
        entityMap: {}
      }.to_json
    end

    def media_block(data)
      media_type = data['type']
      case media_type
      when 'unsupported' then nil
      when 'image'
        url = data['image']['url']
        text = data['image']['caption']
        photo_block(url: url, text: text)
      when 'video'
        url = data['video']['url']
        text = data['video']['caption']
        gif_block(url: url, text: text)
      when 'audio'
        url = data['audio']['url']
        text = data['audio']['caption']
        file_block(url: url, text: text)
      end
    end

    def add_participant(vonage_user)
      app = @package.app
      if vonage_user

        data = {
          properties: {
            name: vonage_user
          }
        }

        external_profile = app.external_profiles.find_by(
          provider: PROVIDER,
          profile_id: vonage_user
        )

        participant = external_profile&.app_user

        ## todo: check user for this & previous conversation
        ## via twitter with the twitter user id
        if participant.blank?
          participant = app.add_anonymous_user(data)
          participant.external_profiles.create(
            provider: PROVIDER,
            profile_id: vonage_user
          )
        end

        participant
      end
    end
  end
end
