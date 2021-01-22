# frozen_string_literal: true

module MessageApis
  class Twilio
    # https://developers.pipedrive.com/docs/api/v1/
    BASE_URL = 'https://api.pipedrive.com/v1'
    PROVIDER = 'twilio'

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

      @conn.basic_auth(@api_key, @api_token)

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
      
      case params["SmsStatus"]
      when "read" then process_read(params)
      #when "DELIVERED" then puts("DELIVERED!")
      when "received" then process_message(params, @package)
      #when "updated" then update_app_user_profile(current)
      #when "deleted" then delete_app_user_profile(params)
      end
    end

    def process_read(params)
      message_id = params["MessageSid"]
      conversation_part_channel = ConversationPartChannelSource.find_by(
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
                .find_by(provider: "twilio").present?
      
      message = part.message.as_json

      response = send_message(conversation, message)

      response_data = JSON.parse(response.body)

      message_id = response_data["sid"]

      return unless message_id.present?

      part.conversation_part_channel_sources.create(
        provider: 'twilio', 
        message_source_id: message_id
      )
    end

    def send_message(conversation, message)

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      # TODO: support more blocks
      image_block = blocks.find{|o| o["type"] == "image"}

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
        From: "whatsapp:#{@phone}",
        Body: plain_message,
        To: profile_id
      }

      message_params.merge!({
        MediaUrl: ENV["HOST"] + image_block["data"]["url"]
      }) if image_block

      @conn.post(
        @url,
        message_params
      )
    end

    def process_message(params, package)
      @package = package

      app = package.app

      sender_id = params["From"]
      target_id = params["To"]
      message_id = params["SmsMessageSid"]
      sender = params["From"]
      recipient = params["To"]

      # determine the id of the user (channel)
      cond = sender_id == "whatsapp:#{package.user_id.gsub('whatsapp:', '')}"
      channel_id = cond ? target_id : sender_id 
      twilio_user = cond ? recipient : sender
      agent_sender = cond

      conversation = find_conversation_by_channel(channel_id)

      return if conversation && conversation.conversation_part_channel_sources
      .find_by(message_source_id: message_id).present?

      text = params["Body"]

      serialized_content = serialize_content(params)
      
      participant = add_participant(twilio_user)

      conversation = app.conversations.create(
        main_participant: participant,
        conversation_channels_attributes: [
          provider: 'twilio',
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
                          "twilio", channel
                        ).first
    end

    def serialize_content(data)
      text = data["Body"]

      data["NumMedia"].to_i > 0 ? 
      attachment_block(data) : 
      text_block(data['Body'])
    end

    def attachment_block(data)

      attachment = data['attachment']

      media_blocks = []

      data["NumMedia"].to_i.times do |num|
        media_blocks << media_block(num, data)
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

    def media_block(num, data)
      attachment = data["MediaUrl#{num}"]
      media_type = data["MediaContentType#{num}"]
      text = data["Body"]

      case media_type
        when "image/gif" then photo_block(attachment, text)
        when "image/jpeg" then photo_block(attachment, text)
        when "video/mp4" then gif_block(attachment, text)
        # TODO: support audio as content block
        # "audio/ogg" then ....
        else file_block(attachment, "media: #{media_type}")
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

        # use external profiles
        #participant = app.app_users.where(
        #  "properties->>'twilio_id' = ?", twilio_user
        #).first

        ## todo: check user for this & previous conversation
        ## via twitter with the twitter user id
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
