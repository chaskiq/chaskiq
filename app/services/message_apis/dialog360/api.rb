# frozen_string_literal: true

require "rack/mime"

module MessageApis::Dialog360
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    PROVIDER = "dialog_360"

    attr_accessor :url, :api_key, :conn

    def initialize(config:)
      @api_key = config["api_key"]
      @api_token = config["api_secret"]
      @phone = config["user_id"]
      @url = if config["sandbox"].present?
               "https://waba-sandbox.360dialog.io/v1"
             else
               "https://waba.360dialog.io/v1"
             end
      @package = config[:package]
      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        "D360-Api-Key": @api_key,
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }

      self
    end

    def register_webhook(app_package, integration)
      data = {
        url: integration.hook_url # .gsub("http://localhost:3000", "https://chaskiq.sa.ngrok.io")
      }

      response = @conn.post("#{@url}/configs/webhook", data.to_json)
      response.status
    end

    def retrieve_templates(offset:)
      response = @conn.get("#{@url}/configs/templates?limit=10&offset=#{offset}")
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
      current = params["current"]

      process_statuses(params["statuses"]) if params["statuses"].present?

      process_message(params, @package) if params["messages"].present?
    end

    def process_statuses(statuses)
      statuses.each do |status|
        case status["status"]
        when "read" then process_read(status["id"])
        when "failed" then process_error(status)
        else
          Rails.logger.info "no processing for #{status['status']} event"
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
      conversation_part_channel = find_channel(params["id"])
      return if conversation_part_channel.blank?

      conversation = conversation_part_channel.conversation_part.conversation

      # crea el mensaje con el channel de una, asi cuando se cree
      # el notify_message va a bypasear el canal
      # conversation.add_message()

      errors = params["errors"]
      msg = ""
      msg = errors.map { |o| "#{o['code']} #{o['title']}" }.join if errors.is_a?(Array)

      conversation.add_message_event(
        action: "errored: #{msg}",
        provider: PROVIDER,
        message_source_id: "bypass-internal-#{params['id']}",
        data: {
          status: params
        }
      )
    end

    def get_message_id(response_data)
      response_data["messages"].first["id"]
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json

      return nil if message["serialized_content"].blank?

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      # TODO: support more blocks
      image_block = blocks.find { |o| o["type"] == "image" }
      video_block = blocks.find { |o| o["type"] == "recorded-video" }
      audio_block = blocks.find { |o| o["type"] == "recorded-audio" }
      file_block = blocks.find { |o| o["type"] == "file" }
      is_plain = !image_block || !video_block || !file_block
      plain_message = blocks.map do |o|
        o["text"]
      end.join("\r\n")

      profile_id = get_profile_for_participant(conversation.main_participant)

      # TODO: maybe handle an error here ?
      return if profile_id.blank?

      message_params = {
        from: { type: "whatsapp", number: @phone },
        to: profile_id
      }

      endpoint = Chaskiq::Config.get("HOST") # "https://chaskiq.sa.ngrok.io"

      # TODO: support audio / video / gif
      if image_block
        message_params.merge!({
                                type: "image",
                                image: {
                                  link: endpoint + image_block["data"]["url"],
                                  caption: plain_message
                                }
                              })
      elsif video_block
        message_params.merge!({
                                type: "video",
                                video: {
                                  link: endpoint + video_block["data"]["url"],
                                  caption: plain_message
                                }
                              })

      elsif audio_block
        message_params.merge!({
                                type: "audio",
                                audio: {
                                  link: endpoint + audio_block["data"]["url"]
                                }
                              })

      elsif file_block
        message_params.merge!({
                                type: "document",
                                document: {
                                  link: endpoint + file_block["data"]["url"],
                                  caption: plain_message
                                }
                              })
      elsif is_plain
        message_params.merge!({
                                type: "text",
                                text: { body: plain_message }
                              })
      end

      r = @conn.post(
        "#{@url}/messages",
        message_params.to_json
      )

      Rails.logger.debug "---###########---"

      Rails.logger.info r.body

      Rails.logger.debug "---###########---"

      r
    end

    def upload_media(media)
      # conn = @conn do |f|
      #  f.request :multipart
      #  f.request :url_encoded
      #  f.adapter :net_http # This is what ended up making it work
      # end

      # payload = { :file => Faraday::UploadIO.new('...', 'image/jpeg') }

      # conn.post('/', payload)
    end

    def get_profile_for_participant(participant)
      participant
        &.external_profiles
        &.find_by(provider: PROVIDER)
        &.profile_id
    end

    def get_profile_for_participant_label(participant)
      if (l = get_profile_for_participant(participant)) && l.present?
        "Dialog360 profile: #{l}"
      end
    end

    def prepare_initiator_channel_for(conversation, package)
      Rails.logger.debug conversation.inspect
      @package = package

      profile_id = conversation.main_participant
                                &.external_profiles
                                &.find_by(provider: PROVIDER)
                                &.profile_id

      profile_id = add_participant_to_existing_user(conversation.main_participant, conversation.main_participant.phone) if profile_id.blank?

      raise ActiveRecord::Rollback if profile_id.blank?

      conversation = find_conversation_by_channel(PROVIDER, profile_id) || conversation
      # clear_conversation(previous_conversation) if previous_conversation.present?

      conversation.update(
        conversation_channels_attributes: [
          provider: PROVIDER,
          provider_channel_id: profile_id
        ]
      )
    end

    def add_participant_to_existing_user(app_user, phone)
      dialog_user = phone.to_s

      app = @package.app

      external_profile = app.external_profiles.find_by(
        provider: PROVIDER,
        profile_id: dialog_user
      )

      # creates the profile
      if external_profile.blank?
        app_user.external_profiles.create(
          provider: PROVIDER,
          profile_id: dialog_user
        )
        app_user.update(phone: dialog_user)
      end
      dialog_user

      # participant = external_profile&.app_user
      # means the external profile belongs to somebody else
      # return nil if participant && participant.id != app_user.id
      # dialog_user if participant && participant.id == app_user.id
    end

    def send_template_message(template:, conversation_key:, parameters:, selected_user:)
      parameters = [parameters] unless parameters.is_a?(Array)

      conversation = @package.app.conversations.find_by(key: conversation_key)
      profile_id = nil

      if conversation.blank? && conversation_key.blank? && selected_user.present?
        participant = @package.app.app_users.find(selected_user)

        profile_id = get_profile_for_participant(participant)

        conversation = find_conversation_by_channel(PROVIDER, profile_id) if profile_id.present?

        options = {
          # from: author,
          participant: participant,
          initiator_channel: PROVIDER
        }

        conversation = @package.app.start_conversation(options) if conversation.blank?
      end

      profile_id = get_profile_for_participant(conversation.main_participant) if profile_id.blank?

      profile_id = add_participant_to_existing_user(conversation.main_participant, conversation.main_participant.phone) if profile_id.blank?

      Rails.logger.debug template
      return if profile_id.blank?

      paramters_list = parameters.compact

      data = {
        to: profile_id,
        type: "template",
        template: {
          namespace: template["namespace"],
          name: template["name"],
          language: {
            policy: "deterministic",
            code: template["language"]
          },
          components: [{
            type: "body",
            parameters: paramters_list.map { |o| { type: "text", text: o } }
          }]
        }
      }

      Rails.logger.debug "***************"
      Rails.logger.debug data

      s = @conn.post(
        "#{@url}/messages",
        data.to_json
      )

      # puts "TEMPLATE ******* "
      # puts template

      json = JSON.parse(s.body)

      if s.success?
        json_message = json["messages"].first
        return if json_message.blank?

        message_id = json_message["id"]

        conversation.add_message(
          from: @package.app.agents.first,
          message: {
            html_content: "WHATSAPP TEMPLATE SENT: #{template['name']}"
            # serialized_content: serialized_content
          },
          provider: PROVIDER,
          message_source_id: message_id,
          check_assignment_rules: false
        )

      end
      json.merge({ "conversation_key" => conversation.key })
    end

    # not used fro now
    def mark_as_read(id)
      message_params = {
        status: "read"
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

      mime = content_type.split(";").first
      extension = Rack::Mime::MIME_TYPES.invert[mime].to_s

      direct_upload(
        file: StringIO.new(file_string),
        filename: "#{id}#{extension}",
        content_type: content_type || "image/jpeg"
      )
    end

    def process_message(params, package)
      @package = package

      app = package.app

      messages = params["messages"]

      messages.each do |message|
        sender_id = message["from"]
        message_id = message["id"]

        # determine the id of the user (channel)
        is_agent = sender_id == package.user_id.to_s

        channel_id = sender_id
        dialog_user = sender_id

        conversation = find_conversation_by_channel(PROVIDER, channel_id)

        next if conversation && conversation.conversation_part_channel_sources
                                            .find_by(message_source_id: message_id).present?

        text = message.dig("text", "body")

        serialized_content = serialize_content(message)

        participant = add_participant(dialog_user, message, params["contacts"])

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

    def serialize_content(data)
      if (text = data.dig("text", "body")) && text
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
      media_type = data["type"]
      case media_type
      when "unsupported" then nil
      when "image", "sticker"
        url = data[data["type"]]
        text = data[data["type"]]["caption"]
        file = handle_direct_upload(url["id"], url["mime_type"])
        photo_block(url: file[:url], text: text)
      when "video"
        url = data["video"]
        text = data["video"]["caption"]
        file = handle_direct_upload(url["id"], url["mime_type"])
        gif_block(url: file[:url], text: text)
      when "audio", "voice", "document"
        url = data[media_type]
        text = data[media_type]["caption"]
        file = handle_direct_upload(url["id"], url["mime_type"])
        file_block(url: file[:url], text: text)
      end
    end

    def add_participant(dialog_user, message, contacts = [])
      app = @package.app
      profile = contacts.find { |o| o["wa_id"] == dialog_user }

      if dialog_user

        profile_data = {
          name: dialog_user
        }

        if profile
          profile_data.merge!({
                                name: profile.dig("profile", "name")
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
          participant.update(phone: dialog_user)
        end

        participant
      end
    end
  end
end
