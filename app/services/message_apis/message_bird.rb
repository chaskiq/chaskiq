# frozen_string_literal: true

module MessageApis
  class Vonage
    PROVIDER = 'message_bird'

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config["api_key"]
      @api_token = config["api_secret"]
      @phone = config["user_id"]

			@url = "https://conversations.messagebird.com/v1/conversations/#{@api_key}/messages"
			
      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
			)

			@conn.authorization :AccessKey, @api_token
			
			@conn.headers = { 
				'Content-Type'=> 'application/json',
				'Accept'=> 'application/json'
      }

      self
    end

    def trigger(event)
      #case event.action
      #when 'email_changed' then register_contact(event.eventable)
      #end
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      @package = package
			current = params["current"]

			if params["status"].present?
				case params["status"]
				when "read" 
					process_read(params)
					return
				else
					return
				end
			end
			
			process_message(params, @package)
      
    end

    def process_read(params)
      message_id = params["message_uuid"]
      conversation_part_channel = ConversationPartChannelSource.find_by(
				provider: PROVIDER,
        message_source_id: message_id
      )
      return if conversation_part_channel.blank?
      conversation_part_channel.conversation_part.read!
    end

    # triggered when a new chaskiq message is created
    # will triggered just after the ws notification
    def notify_message(conversation: , part:, channel:)
      # TODO ? redis cache here for provider / channel id / part
      return if part
                .conversation_part_channel_sources
                .find_by(provider: PROVIDER).present?
      
      message = part.message.as_json

      response = send_message(conversation, message)

      response_data = JSON.parse(response.body)

      message_id = response_data["message_uuid"]

      return unless message_id.present?

      part.conversation_part_channel_sources.create(
        provider: PROVIDER, 
        message_source_id: message_id
      )
    end

    def send_message(conversation, message)

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      # TODO: support more blocks
			image_block = blocks.find{|o| o["type"] == "image"}
			video_block = blocks.find{|o| o["type"] == "recorded-video"}
			file_block = blocks.find{|o| o["type"] == "file"}

      plain_message = blocks.map{|o| 
        o["text"]
      }.join("\r\n")

      profile_id = conversation.main_participant
                               &.external_profiles
                               &.find_by(provider: PROVIDER)
                               &.profile_id

      # TODO: maybe handle an error here ?                        
			return if profile_id.blank?

      message_params = {          
				"from": { "type": "whatsapp", "number": @phone },
    		"to": { "type": "whatsapp", "number": profile_id },
        message: {
					content: {
						type: 'text', 
						text: plain_message
					}
				}
      }

			# TODO: support audio / video / gif
      message_params.merge!({
				message: {
					content: {
						type: 'image', 
						image: {
							url: ENV["HOST"] + image_block["data"]["url"],
							caption: plain_message
						}
					}
				}
			}) if image_block

			message_params.merge!({
				message: {
					content: {
						type: 'video', 
						video: {
							url: ENV["HOST"] + video_block["data"]["url"],
							caption: plain_message
						}
					}
				}
			}) if video_block

			message_params.merge!({
				message: {
					content: {
						type: 'file', 
						file: {
							url: ENV["HOST"] + file_block["data"]["url"],
							caption: plain_message
						}
					}
				}
			}) if file_block

      s = @conn.post(
        @url,
        message_params.to_json
			)
    end

    def process_message(params, package)
      @package = package

			app = package.app

      sender_id = params["from"]["number"]
      target_id = params["to"]["number"]
      message_id = params["message_uuid"]
      sender = params["from"]["number"]
      recipient = params["to"]["number"]

      # determine the id of the user (channel)
			cond = sender_id == "#{package.user_id}"
			
      channel_id = cond ? target_id : sender_id 
      vonage_user = cond ? recipient : sender
      agent_sender = cond

      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
      .find_by(message_source_id: message_id).present?

      text = params.dig("message", "content", "text")

      serialized_content = serialize_content(params)
      
      participant = add_participant(vonage_user)

      conversation = app.conversations.create(
        main_participant: participant,
        conversation_channels_attributes: [
          provider: PROVIDER,
          provider_channel_id: channel_id
        ]
      ) if conversation.blank?

      # TODO: serialize message                 
      conversation.add_message(
        from: agent_sender ? @package.app.agents.first : participant  , #agent_required ? Agent.first : participant,
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
      text = data.dig("message", "content", "text")
      if data.dig("message", "content", "type") == "text"
				text_block(text) if text.present?
			else
				attachment_block(data)
			end
    end

    def attachment_block(data)
			image_data = data.dig("message", "content")
      {
        "blocks": [media_block(image_data)],
        "entityMap":{}
      }.to_json
    end
  
		def text_block(text)
      lines = text.split("\n").delete_if(&:empty?)
      {
        "blocks": lines.map{|o| serialized_block(o)} ,
        "entityMap":{}
      }.to_json
    end
  
    def serialized_block(text)
      {
        "key":"f1qmb",
        "text": text,
        "type":"unstyled",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{}
      }
    end

		def media_block(data)
			media_type = data["type"]
			case media_type
				when "unsupported" then nil
				when "image"
					url = data["image"]["url"]
					text = data["image"]["caption"]
					photo_block(url, text)
				when "video"
					url = data["video"]["url"]
					text = data["video"]["caption"]
					gif_block(url, text)
				when "audio"
					url = data["audio"]["url"]
					text = data["audio"]["caption"]
					file_block(url, text)
				else
      end
    end

    def gif_block(url, text)
      #media = data['attachment']["media"]
      #variant = media["video_info"]["variants"][0]
      #url = direct_upload(variant["url"], variant["content_type"])
      #text = data['text'].split(" ").last
      {
        "key": keygen,
        "text": text ,
        "type": "recorded-video",
        "depth": 0,
        "inlineStyleRanges": [],
        "entityRanges": [],
        "data": {
          "rejectedReason": "",
          "secondsLeft": 0,
          "fileReady": true,
          "paused": false,
          "url": url,
          "recording": false,
          "granted": true,
          "loading": false,
          "direction": "center"
        }
      }
    end

    def file_block(url, text)
      {
        "key": keygen,
        "text": text,
        "type":"file",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{
          "caption": text,
          "forceUpload":false,
          "url": url,
          "loading_progress":0,
          "selected":false,
          "loading":true,
          "file":{},
          "direction":"center"
        }
      }
    end

    def photo_block(url, text)
      {
        "key": keygen,
        "text": text,
        "type":"image",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{
          #"aspect_ratio":{
          #  "width": media["sizes"]["small"]["w"].to_i,
          #  "height": media["sizes"]["small"]["h"].to_i,
          #  "ratio":100
          #},
          "width": 100, #media["sizes"]["small"]["w"].to_i,
          "height": 100, #media["sizes"]["small"]["h"].to_i,
          "caption": text,
          "forceUpload":false,
          "url": url,
          "loading_progress":0,
          "selected":false,
          "loading":true,
          "file":{},
          "direction":"center"
        }
      }
    end

    def keygen
      ('a'..'z').to_a.shuffle[0,8].join
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
