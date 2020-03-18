# frozen_string_literal: true

module MessageApis
  class Messenger
    BASE_URL = 'https://graph.facebook.com/v2.6'

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config["api_key"]
      @api_token = config["api_secret"]

      @url = "#{BASE_URL}/me/messages?access_token=#{@api_token}"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      self
    end

    def trigger(event)
      #case event.action
      #when 'email_changed' then register_contact(event.eventable)
      #end
    end

    def response_with_text?
      true
    end

    def create_hook_from_params(params, package)

      token = params["hub.verify_token"]
      mode = params["hub.mode"]
      challenge = params["hub.challenge"]

      # naive auth
      key = package.app.key+package.id.to_s

      # Checks if a token and mode is in the query string of the request
      if mode && token 
        # Checks the mode and token sent is correct
        if mode === 'subscribe' && token === key
          # Responds with the challenge token from the request
          challenge
         else 
          # Responds with '403 Forbidden' if verify tokens do not match
          nil     
        end
      end
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

      if params["object"] == "page" && params["entry"].present?
        process_message(params, @package)
      end
    end

    # triggered when a new chaskiq message is created
    # will triggered just after the ws notification
    def notify_message(conversation:, part:, channel:)

      # TODO ? redis cache here for provider / channel id / part
      return if part
                .conversation_part_channel_sources
                .find_by(provider: "messenger").present?
      
      message = part.message.as_json

      response = send_message(conversation, message)

      response_data = JSON.parse(response.body)

      message_id = response_data["message_id"]

      return unless message_id.present?

      
      part.conversation_part_channel_sources.create(
        provider: 'messenger', 
        message_source_id: message_id
      )
    end

    def send_message(conversation, message)

      provider_channel_id = conversation.conversation_channels
      .find_by(provider: "messenger")
      .provider_channel_id

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      plain_message = blocks.map{|o| 
        o["text"]
      }.join("\r\n")

      request_body = {
        "recipient": {
          "id": provider_channel_id
        },
        "message": {"text": plain_message}
      }
      
      response = @conn.post(
        @url,
        request_body.to_json,
        "Content-Type" => "application/json"
      )

    end

    def process_message(params, package)
      @package = package

      app = package.app

      entry = params["entry"].first
      message = entry["messaging"].first

      sender_id = message["sender"]["id"]
      target_id = message["recipient"]["id"]

      return unless message.keys.include?("message")
   
      message_id = message["message"]["mid"]
      sender = sender_id
      recipient = target_id

      # determine the id of the user (channel)
      cond = message["message"]["is_echo"]
      channel_id = cond ? target_id : sender_id 
      messenger_user = cond ? recipient : sender
      agent_sender = cond
      
      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
      .find_by(message_source_id: message_id).present?

      text = message["message"]["text"]
    
      serialized_content = serialize_content(message)
      
      return if serialized_content.blank?

      participant = add_participant(messenger_user)

      #conversation.conversation_channels.create({
      #  provider: 'messenger',
      #  provider_channel_id: channel_id
      #}) if conversation.blank?

      conversation = app.conversations.create(
        main_participant: participant,
        conversation_channels_attributes: [
          provider: 'messenger',
          provider_channel_id: channel_id
        ]
      ) if conversation.blank?

      conversation.add_message(
        from: agent_sender ? @package.app.agents.first : participant,
        message: {
          html_content: text,
          serialized_content: serialized_content
        },
        provider: 'messenger',
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
      data["message"].keys.include?("attachments") ?
      attachment_block(data) : 
      text_block(text)
    end

    def attachment_block(data)

      attachments = data["message"]["attachments"]

      media_blocks = []

      attachments.each do |attachment|
        media_blocks << media_block(attachment)
      end

      {
        "blocks": media_blocks,
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

    def media_block(attachment)
      #attachment = data["MediaUrl#{num}"]
      #media_type = data["MediaContentType#{num}"]
      #text = data["Body"]

      case attachment['type']
        when "image" then photo_block(attachment["payload"]["url"])
        #when "image/jpeg" then photo_block(attachment, text)
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

    def photo_block(url)
      {
        "key": keygen,
        "text": '',
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
          "caption": '',
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

    def get_fb_profile(id)
      #curl -X GET "https://graph.facebook.com/<PSID>?fields=first_name,last_name,profile_pic&access_token=<PAGE_ACCESS_TOKEN>"
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

        data = {
          properties: {
            messenger_id: messenger_user
          }
        }

        # TODO: use external profiles
        participant = app.app_users.where(
          "properties->>'messenger_id' = ?", messenger_user
        ).first
        
        if participant.blank?
          profile_data = get_fb_profile(messenger_user)
          if profile_data.keys.include?("first_name")
            name = "#{profile_data["first_name"]} #{profile_data["last_name"]}"
            profile_data.merge!(name: name)
            data.deep_merge!(
              properties: profile_data.except("id")
            ) 
          end
        end

        participant = app.add_anonymous_user(data) if participant.blank?

        participant
      end
    end


  end
end
