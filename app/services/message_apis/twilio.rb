# frozen_string_literal: true

module MessageApis
  class Twilio
    # https://developers.pipedrive.com/docs/api/v1/
    BASE_URL = 'https://api.pipedrive.com/v1'

    attr_accessor :url, :api_token, :api_key, :conn

    def initialize(config:)
      @api_key = config["api_key"]
      @api_token = config["api_secret"]

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

    # seen 

    #{"EventType"=>"READ",
    #  "SmsSid"=>"SMbe440a0cecc344a98fae361e8c342c68",
    #  "SmsStatus"=>"read",
    #  "MessageStatus"=>"read",
    #  "ChannelToAddress"=>"+56992302305",
    #  "To"=>"whatsapp:+56992302305",
    #  "ChannelPrefix"=>"whatsapp",
    #  "MessageSid"=>"SMbe440a0cecc344a98fae361e8c342c68",
    #  "AccountSid"=>"ACe290c9d3be37c085904226ce7f8a5c57",
    #  "From"=>"whatsapp:+14155238886",
    #  "ApiVersion"=>"2010-04-01",
    #  "ChannelInstallSid"=>"XEad34ff7cdd2bf6924c25cf9071ed21e5",
    #  "controller"=>"api/v1/hooks/provider",
    #  "action"=>"process_event",
    #  "app_key"=>"uQIUx8iou44wJvzV8utsqA",
    #  "provider"=>"twilio",
    #  "id"=>"1"}

    def process_event(params, package)
      @package = package
      current = params["current"]
      
      case params["SmsStatus"]
      when "DELIVERED" then puts("DELIVERED!")
      when "received" then process_message(params, @package)
      #when "updated" then update_app_user_profile(current)
      #when "deleted" then delete_app_user_profile(params)
      end
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

      plain_message = blocks.map{|o| 
        o["text"]
      }.join("\r\n")
      
      @conn.post(
        @url,
        { 
          From: 'whatsapp:+14155238886',
          Body: plain_message,
          To: 'whatsapp:+56992302305'
        }
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
      cond = sender_id == package.user_id
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

    def photo_block(url, text)

      #media = data['attachment']['media']
      #url = direct_upload(media["media_url_https"])
      #text = data['text'].split(" ").last

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
            #name: twilio_user["name"],
            twilio_id: twilio_user
          }
        }

        # use external profiles
        participant = app.app_users.where(
          "properties->>'twilio_id' = ?", twilio_user
        ).first

        ## todo: check user for this & previous conversation
        ## via twitter with the twitter user id
        participant = app.add_anonymous_user(data) if participant.blank?

        participant
      end
    end


  end
end
