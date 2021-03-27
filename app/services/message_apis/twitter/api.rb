# frozen_string_literal: true

# t = MessageApis::Twitter.new()
# s = CGI.escape("https://6404e5bc.ngrok.io/api/v1/hooks/twitter")

# create & validate
# t.make_post_request("/1.1/account_activity/all/development/webhooks.json?url=#{s}", nil)

# validate weebhook
#  t.make_put_request("/1.1/account_activity/all/development/webhooks/1217301228083871744.json")

# create subscription
# t.make_post_request("/1.1/account_activity/all/development/subscriptions.json", nil)

# delete subscrptoin

# data = {
#   "event": {
#     "type": "message_create",
#     "message_create": {
#       "target": {
#         "recipient_id": "1140620289006551040"
#       },
#       "message_data": {
#         "text": "Hello World!"
#       }
#     }
#   }
# }
#
# t.make_post_request("/1.1/direct_messages/events/new.json", data.to_json)
#

require 'base64'

module MessageApis::Twitter
  class Api < MessageApis::BasePackage
    BASE_URL = 'https://api.twitter.com'
    PROVIDER = 'twitter'
    HEADERS = { 'content-type' => 'application/json' }.freeze # Suggested set? Any?
    include MessageApis::Helpers
    attr_accessor :keys,
                  :twitter_api,
                  :base_url # Default: 'https://api.twitter.com/'

    def initialize(config = {})
      @base_url = 'https://api.twitter.com'
      @uploader_base_url = 'https://upload.twitter.com'
      @keys = {}

      config = config[:config]

      @keys['consumer_key'] = config['api_key']
      @keys['consumer_secret'] = config['api_secret']
      @keys['access_token'] =  config['access_token']
      @keys['access_token_secret'] = config['access_token_secret']
    end

    # API client object is created with the @base_url context,
    # then individual requests are made with specific URI paths passed in.
    def get_api_access
      consumer = OAuth::Consumer.new(
        @keys['consumer_key'],
        @keys['consumer_secret'],
        { site: @base_url }
      )

      uploader_consumer = OAuth::Consumer.new(
        @keys['consumer_key'],
        @keys['consumer_secret'],
        { site: @uploader_base_url }
      )

      token = { oauth_token: @keys['access_token'],
                oauth_token_secret: @keys['access_token_secret'] }

      @twitter_api = OAuth::AccessToken.from_hash(consumer, token)
      @twitter_media_api = OAuth::AccessToken.from_hash(uploader_consumer, token)
    end

    def create_hook_from_params(params, package)
      crc_token = params['crc_token']
      unless crc_token.nil?
        response = {}
        response['response_token'] = "sha256=#{generate_crc_response(package.api_secret, crc_token)}"
        response
      end
    end

    def enqueue_process_event(params, package)
      return create_hook_from_params(params, package) if params['crc_token'].present?

      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )

      { status: :ok }
    end

    def find_conversation_by_channel(channel)
      conversation = @package
                     .app
                     .conversations
                     .joins(:conversation_channels)
                     .where(
                       "conversation_channels.provider =? AND
        conversation_channels.provider_channel_id =?",
                       'twitter', channel
                     ).first
    end

    # incoming events from webhook
    def process_event(params, package)
      @package = package

      app = package.app

      if params.keys.include?('direct_message_events')
        params['direct_message_events'].each do |message|
          sender_id = message['message_create']['sender_id']
          target_id = message['message_create']['target']['recipient_id']
          message_id = message['id']
          sender = params['users'][sender_id]
          recipient = params['users'][target_id]

          # determine the id of the user (channel)
          cond = sender_id == params['for_user_id']
          channel_id = cond ? target_id : sender_id
          twitter_user = cond ? recipient : sender
          agent_sender = cond

          conversation = find_conversation_by_channel(channel_id)

          next if conversation && conversation.conversation_part_channel_sources
                                              .find_by(message_source_id: message_id).present?

          message_data = message['message_create']['message_data']
          text = message_data['text']

          serialized_content = serialize_content(
            message_data
          )

          participant = add_participant(twitter_user)

          # conversation.conversation_channels.create({
          #  provider: 'twitter',
          #  provider_channel_id: channel_id
          # }) if conversation.present?

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
            from: agent_sender ? @package.app.agents.first : participant, # agent_required ? Agent.first : participant,
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
    end

    def get_message_id(response_data)
      response_data.dig('event', 'id')
    end

    def send_message(conversation, message)
      event = {}
      event['event'] = message_create_header(
        conversation.main_participant.properties['twitter_id']
      )

      blocks = JSON.parse(
        message['serialized_content']
      )['blocks']

      plain_message = blocks.map do |o|
        o['text']
      end.join("\r\n")

      message_data = {}
      message_data['text'] = plain_message
      event['event']['message_create']['message_data'] = message_data

      image_block = blocks.find { |o| o['type'] == 'image' }

      if image_block.present?

        url = image_block['data']['url']
        url = "#{ENV['HOST']}#{url}" unless image_block['data']['url'].include?('http')

        if (uploaded_data = upload_media(url)) && uploaded_data.present?
          attachment = {}
          attachment['type'] = 'media'
          attachment['media'] = {}
          attachment['media']['id'] = uploaded_data['media_id_string']
          message_data['attachment'] = attachment
        end
      end

      make_post_request('/1.1/direct_messages/events/new.json', event.to_json)
    end

    def add_participant(twitter_user)
      app = @package.app
      if twitter_user
        data = {
          properties: {
            name: twitter_user['name']
          }
        }

        external_profile = app.external_profiles.find_by(
          provider: PROVIDER,
          profile_id: twitter_user['id']
        )

        participant = external_profile&.app_user

        ## todo: check user for this & previous conversation
        ## via twitter with the twitter user id
        if participant.blank?
          participant = app.add_anonymous_user(data)
          participant.external_profiles.create(
            provider: PROVIDER,
            profile_id: twitter_user['id']
          )
        end

        participant
      end
    end

    def generate_crc_response(consumer_secret, crc_token)
      hash = OpenSSL::HMAC.digest('sha256', consumer_secret, crc_token)
      Base64.encode64(hash).strip!
    end

    ## MESSAGE BLOCK METHODS CONVERSION

    def message_create_header(recipient_id)
      header = {}

      header['type'] = 'message_create'
      header['message_create'] = {}
      header['message_create']['target'] = {}
      header['message_create']['target']['recipient_id'] = recipient_id.to_s

      header
    end

    def serialize_content(data)
      if data.keys.include?('attachment')
        attachment_block(data)
      else
        text_block(data['text'])
      end
    end

    def attachment_block(data)
      attachment = data['attachment']
      a = case attachment['type']
          when 'media' then media_block(data)
          end

      lines = data['text'].gsub(attachment['media']['url'], '')
                          .split("\n").delete_if(&:empty?)

      text_blocks = lines.map { |o| serialized_block(o) }

      {
        blocks: [a, *text_blocks].compact,
        entityMap: {}
      }.to_json
    end

    def media_block(data)
      attachment = data['attachment']
      attachment['media']

      case attachment['media']['type']
      when 'animated_gif'
        media = data['attachment']['media']
        variant = media['video_info']['variants'][0]
        file = handle_direct_upload(variant['url'], variant['content_type'])
        text = data['text'].split.last
        gif_block(url: file[:url], text: text)
      when 'photo'
        media = data['attachment']['media']
        file = handle_direct_upload(media['media_url_https'])
        text = data['text'].split.last
        photo_block(url: file[:url], text: text)
      end
    end

    def handle_direct_upload(url, content_type = nil)
      file_string = get_media(url)
      file = StringIO.new(file_string)

      direct_upload(
        file: file,
        filename: File.basename(url),
        content_type: content_type || 'image/jpeg'
      )
    end

    def get_media(url)
      make_get_request(url)
    end

    def make_post_media_request(uri_path, request, headers = nil)
      get_api_access if @twitter_media_api.nil? # token timeout?

      response = @twitter_media_api.post(uri_path, request,
                                         headers || HEADERS)

      if response.code.to_i >= 300
        puts "POST ERROR occurred with #{uri_path}, request: #{request} "
        puts "Error code: #{response.code} #{response}"
        puts "Error Message: #{response.body}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        JSON.parse(response.body)
      end
    end

    # @see https://dev.twitter.com/rest/public/uploading-media
    # idea taken from twitter gem twitter/rest/upload_utils.rb
    def upload_media(media, media_category_prefix: 'dm')
      file = URI.parse(media).open
      # TODO: try to get the id of blob in case of Active storage
      mime = Marcel::MimeType.for(file)

      return chunk_upload(file, mime, "#{media_category_prefix}_video") if mime.include?('mp4')
      return chunk_upload(file, mime, "#{media_category_prefix}_gif") if mime.include?('gif') # && File.size(media) > 5_000_000
      return chunk_upload(file, mime, "#{media_category_prefix}_image") if mime.include?('image')

      #
      # make_post_media_request('/1.1/media/upload.json',
      #  {
      #    media_category: "#{media_category_prefix}_image" ,
      #    media: Base64.encode64(open(media, "rb").read)
      #  },
      #  {'Content-Type' => 'multipart/form-data'}
      # )
    end

    def chunk_upload(file, media_type, media_category)
      init = make_post_media_request('/1.1/media/upload.json',
                                     {
                                       command: 'INIT',
                                       media_type: media_type,
                                       media_category: media_category,
                                       total_bytes: file.size
                                     },
                                     { 'Content-Type' => 'multipart/form-data' })

      until file.eof?
        chunk = file.read(5_000_000)
        seg ||= -1

        make_post_media_request('/1.1/media/upload.json',
                                {
                                  command: 'APPEND',
                                  media_id: init['media_id'],
                                  segment_index: seg += 1,
                                  Name: :media,
                                  media_data: Base64.encode64(chunk)
                                },
                                { 'Content-Type' => 'multipart/form-data' })
      end

      file.close

      make_post_media_request('/1.1/media/upload.json',
                              {
                                command: 'FINALIZE',
                                media_id: init['media_id']
                              })
    end
    # API Registration methods

    def register_webhook(app_package, integration)
      url = CGI.escape(integration.hook_url)
      make_post_request("/1.1/account_activity/all/development/webhooks.json?url=#{url}", nil)
    end

    def get_webhooks
      JSON.parse(make_get_request('/1.1/account_activity/all/development/webhooks.json'))
    end

    def unregister(app_package, integration)
      delete_webhooks
    end

    def delete_webhooks
      get_webhooks.each do |o|
        delete_webhook(o['id'])
      end
    end

    def delete_webhook(id)
      make_delete_request("/1.1/account_activity/all/development/webhooks/#{id}.json")
    end

    def subscribe_to_events
      make_post_request('/1.1/account_activity/all/development/subscriptions.json', nil)
    end

    # HTTPS methods

    def make_post_request(uri_path, request)
      get_api_access if @twitter_api.nil? # token timeout?

      response = @twitter_api.post(uri_path, request, HEADERS)

      if response.code.to_i >= 300
        puts "POST ERROR occurred with #{uri_path}, request: #{request} "
        puts "Error code: #{response.code} #{response}"
        puts "Error Message: #{response.body}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_get_request(uri_path)
      get_api_access if @twitter_api.nil? # token timeout?

      response = @twitter_api.get(uri_path, HEADERS)

      if response.code.to_i >= 300
        puts "GET ERROR occurred with #{uri_path}: "
        puts "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_delete_request(uri_path)
      get_api_access if @twitter_api.nil? # token timeout?

      response = @twitter_api.delete(uri_path, HEADERS)

      if response.code.to_i >= 300
        puts "DELETE ERROR occurred with #{uri_path}: "
        puts "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_put_request(uri_path)
      get_api_access if @twitter_api.nil? # token timeout?

      response = @twitter_api.put(uri_path, '', { 'content-type' => 'application/json' })

      puts "#{response.message}  - Rate limited..." if response.code.to_i == 429

      if response.code.to_i >= 300
        puts "PUT ERROR occurred with #{uri_path}, " # request: #{request} "
        puts "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end
  end
end
