# frozen_string_literal: true

module MessageApis::Dialog360
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    PROVIDER = 'dialog_360'

    attr_accessor :url, :api_key, :conn

    def initialize(config:)
      @api_key = config['api_key']
      @api_token = config['api_secret']
      @phone = config['user_id']
      @url = if config['sandbox'].present?
               'https://waba-sandbox.360dialog.io/v1'
             else
               'https://waba.360dialog.io/v1'
             end
      @package = config[:package]
      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        'D360-Api-Key': @api_key,
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
      }

      self
    end

    def register_webhook(app_package, integration)
      data = {
        url: integration.hook_url
      }

      response = @conn.post("#{@url}/configs/webhook", data.to_json)
      response.status
    end

    def retrieve_templates
      response = @conn.get("#{@url}/configs/templates?limit=10")
      response.body
    end

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
      current = params['current']

      process_statuses(params['statuses']) if params['statuses'].present?

      process_message(params, @package) if params['messages'].present?
    end

    def process_statuses(statuses)
      statuses.each do |status|
        case status['status']
        when 'read' then process_read(status)
        when 'failed' then process_error(status)
        else
          puts "no processing for #{status['status']} event"
        end
      end
    end

    def find_channel(id)
      ConversationPartChannelSource.find_by(
        provider: PROVIDER,
        message_source_id: id
      )
    end

    def process_error(params)
      conversation_part_channel = find_channel(params['id'])
      return if conversation_part_channel.blank?

      conversation = conversation_part_channel.conversation_part.conversation

      # crea el mensaje con el channel de una, asi cuando se cree
      # el notify_message va a bypasear el canal
      # conversation.add_message()
      conversation.add_message_event(
        action: 'errored',
        provider: PROVIDER,
        message_source_id: "bypass-internal-#{params['id']}",
        data: {
          status: params
        }
      )
    end

    def process_read(params)
      conversation_part_channel = find_channel(params['id'])
      return if conversation_part_channel.blank?

      conversation_part_channel.conversation_part.read!
    end

    def get_message_id(response_data)
      response_data['messages'].first['id']
    end

    def send_message(conversation, message)
      blocks = JSON.parse(
        message['serialized_content']
      )['blocks']

      # TODO: support more blocks
      image_block = blocks.find { |o| o['type'] == 'image' }
      video_block = blocks.find { |o| o['type'] == 'recorded-video' }
      file_block = blocks.find { |o| o['type'] == 'file' }
      is_plain = !image_block || !video_block || !file_block
      plain_message = blocks.map do |o|
        o['text']
      end.join("\r\n")

      profile_id = get_profile_for_participant(conversation)

      # TODO: maybe handle an error here ?
      return if profile_id.blank?

      message_params = {
        from: { type: 'whatsapp', number: @phone },
        to: profile_id
      }

      # TODO: support audio / video / gif
      if image_block
        message_params.merge!({
                                type: 'image',
                                image: {
                                  link: ENV['HOST'] + image_block['data']['url'],
                                  caption: plain_message
                                }
                              })
      elsif video_block
        message_params.merge!({
                                type: 'video',
                                video: {
                                  url: ENV['HOST'] + video_block['data']['url'],
                                  caption: plain_message
                                }
                              })

      elsif file_block
        message_params.merge!({
                                type: 'document',
                                file: {
                                  url: ENV['HOST'] + file_block['data']['url'],
                                  caption: plain_message
                                }
                              })
      elsif is_plain
        message_params.merge!({
                                type: 'text',
                                text: { body: plain_message }
                              })
      end

      @conn.post(
        "#{@url}/messages",
        message_params.to_json
      )
    end

    def get_profile_for_participant(conversation)
      conversation.main_participant
        &.external_profiles
        &.find_by(provider: PROVIDER)
        &.profile_id
    end

    def send_template_message(template:, conversation_key:, parameters:)
      parameters = parameters.is_a?(Array) ? parameters : [parameters]

      conversation = @package.app.conversations.find_by(key: conversation_key)

      profile_id = get_profile_for_participant(conversation)

      pp template
      return unless profile_id.present?

      data = {
        to: profile_id,
        type: 'hsm',
        hsm: {
          namespace: template['namespace'],
          element_name: template['name'],
          language: {
            policy: 'deterministic',
            code: template['language']
          },
          localizable_params: parameters.compact.map do |o|
            { default: o }
          end
        }
      }

      pp '***************'
      pp data

      s = @conn.post(
        "#{@url}/messages",
        data.to_json
      )
      JSON.parse(s.body)
    end

    # not used fro now
    def mark_as_read(id)
      message_params = {
        status: 'read'
      }
      @conn.post(
        "#{@url}/messages/#{id}",
        message_params.to_json
      )
    end

    def get_media(id)
      response = @conn.get(
        "#{@url}/media/#{id}"
      )
      return nil unless response.success?

      response.body
    end

    def handle_direct_upload(id, content_type = nil)
      file_string = get_media(id)
      file = StringIO.new(file_string)

      direct_upload(
        file: file,
        filename: 'ws360-file',
        content_type: content_type || 'image/jpeg'
      )
    end

    def process_message(params, package)
      @package = package

      app = package.app

      messages = params['messages']

      messages.each do |message|
        sender_id = message['from']
        message_id = message['id']

        # determine the id of the user (channel)
        is_agent = sender_id == package.user_id.to_s

        channel_id = sender_id
        dialog_user = sender_id

        conversation = find_conversation_by_channel(channel_id)

        next if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id).present?

        text = message.dig('text', 'body')

        serialized_content = serialize_content(message)

        participant = add_participant(dialog_user, message, params['contacts'])

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
          from: is_agent ? @package.app.agents.first : participant, # agent_required ? Agent.first : participant,
          message: {
            html_content: text,
            serialized_content: serialized_content
          },
          provider: PROVIDER,
          message_source_id: message_id,
          check_assignment_rules: true
        )
      end
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
      if (text = data.dig('text', 'body')) && text
        text_block(text) if text.present?
      else
        attachment_block(data)
      end
    end

    def attachment_block(data)
      {
        blocks: [media_block(data)],
        entityMap: {}
      }.to_json
    end

    def media_block(data)
      media_type = data['type']
      case media_type
      when 'unsupported' then nil
      when 'image', 'sticker'
        url = data[data['type']]
        text = data[data['type']]['caption']
        file = handle_direct_upload(url['id'], url['mime_type'])
        photo_block(url: file[:url], text: text)
      when 'video'
        url = data['video']
        text = data['video']['caption']
        file = handle_direct_upload(url['id'], url['mime_type'])
        gif_block(url: file[:url], text: text)
      when 'audio', 'voice', 'document'
        url = data[media_type]
        text = data[media_type]['caption']
        file = handle_direct_upload(url['id'], url['mime_type'])
        file_block(url: file[:url], text: text)
      end
    end

    def add_participant(dialog_user, message, contacts = [])
      app = @package.app
      profile = contacts.find { |o| o['wa_id'] == dialog_user }

      if dialog_user

        profile_data = {
          name: dialog_user
        }

        if profile
          profile_data.merge!({
                                name: profile.dig('profile', 'name')
                              })
        end

        data = {
          properties: profile_data
        }

        external_profile = app.external_profiles.find_by(
          provider: PROVIDER,
          profile_id: dialog_user
        )

        participant = external_profile&.app_user

        ## todo: check user for this & previous conversation
        ## via twitter with the twitter user id
        if participant.blank?
          participant = app.add_anonymous_user(data)
          participant.external_profiles.create(
            provider: PROVIDER,
            profile_id: dialog_user
          )
        end

        participant
      end
    end
  end
end
