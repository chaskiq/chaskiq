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

=begin
data = {
  "event": {
    "type": "message_create", 
    "message_create": {
      "target": {
        "recipient_id": "1140620289006551040"
      }, 
      "message_data": {
        "text": "Hello World!"
      }
    }
  }
}

# t.make_post_request("/1.1/direct_messages/events/new.json", data.to_json)

=end

module MessageApis
  class Twitter
    BASE_URL = 'https://api.twitter.com'

    HEADERS = {"content-type" => "application/json"} #Suggested set? Any?

    attr_accessor :keys,
                  :twitter_api,
                  :base_url #Default: 'https://api.twitter.com/'
  
  
    def initialize(config={})
      @base_url = 'https://api.twitter.com'
      @keys = {}
  
      @keys['consumer_key'] = config["api_key"]
      @keys['consumer_secret'] =  config["api_secret"]
      @keys['access_token'] =  config["access_token"]
      @keys['access_token_secret'] =  config["access_token_secret"]
    end

    def register_webhook(app_package, integration)
      url = CGI.escape("#{ENV['HOST']}/api/v1/hooks/#{integration.app.key}/#{app_package.name.underscore}/#{integration.id}")
      self.make_post_request("/1.1/account_activity/all/development/webhooks.json?url=#{url}", nil)
    end

    def get_webhooks
      JSON.parse(self.make_get_request("/1.1/account_activity/all/development/webhooks.json"))
    end

    def delete_webhooks
      get_webhooks.each do |o|
        delete_webhook( o["id"] )
      end
    end

    def delete_webhook(id)
      self.make_delete_request("/1.1/account_activity/all/development/webhooks/#{id}.json")
    end

    def subscribe_to_events
      self.make_post_request("/1.1/account_activity/all/development/subscriptions.json", nil)
    end

    #API client object is created with the @base_url context, then individual requests are made with specific URI paths passed in.
  
    def get_api_access
      consumer = OAuth::Consumer.new(@keys['consumer_key'], @keys['consumer_secret'], {:site => @base_url})
      token = {:oauth_token => @keys['access_token'],
               :oauth_token_secret => @keys['access_token_secret']
      }
  
      @twitter_api = OAuth::AccessToken.from_hash(consumer, token)
  
    end
  
    def make_post_request(uri_path, request)
      get_api_access if @twitter_api.nil? #token timeout?

      response = @twitter_api.post(uri_path, request, HEADERS)
  
      if response.code.to_i >= 300
        puts "POST ERROR occurred with #{uri_path}, request: #{request} "
        puts "Error code: #{response.code} #{response}"
        puts "Error Message: #{response.body}"
      end
  
      if response.body.nil? #Some successful API calls have nil response bodies, but have 2## response codes.
         return response.code #Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        return response.body
      end
  
    end
  
    def make_get_request(uri_path)
      get_api_access if @twitter_api.nil? #token timeout?
  
      response = @twitter_api.get(uri_path, HEADERS)
      
      if response.code.to_i >= 300
        puts "GET ERROR occurred with #{uri_path}: "
        puts "Error: #{response}"
      end
  
      if response.body.nil? #Some successful API calls have nil response bodies, but have 2## response codes.
        return response.code #Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        return response.body
      end
    end
  
    def make_delete_request(uri_path)
      get_api_access if @twitter_api.nil? #token timeout?
  
      response = @twitter_api.delete(uri_path, HEADERS)
  
      if response.code.to_i >= 300
        puts "DELETE ERROR occurred with #{uri_path}: "
        puts "Error: #{response}"
      end
  
      if response.body.nil? #Some successful API calls have nil response bodies, but have 2## response codes.
        return response.code #Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        return response.body
      end
    end
  
    def make_put_request(uri_path)
  
      get_api_access if @twitter_api.nil? #token timeout?
  
      response = @twitter_api.put(uri_path, '', {"content-type" => "application/json"})
  
      if response.code.to_i == 429
        puts "#{response.message}  - Rate limited..."
      end
  
      if response.code.to_i >= 300
        puts "PUT ERROR occurred with #{uri_path}, " #request: #{request} "
        puts "Error: #{response}"
      end
  
      if response.body.nil? #Some successful API calls have nil response bodies, but have 2## response codes.
        return response.code #Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        return response.body
      end
  
    end

    def create_hook_from_params(params, package)
      crc_token = params['crc_token']
      if not crc_token.nil?
        response = {}
        response['response_token'] = "sha256=#{generate_crc_response(package.api_secret, crc_token)}"
        response
      end
    end

    def process_event(params, package)

      app = package.app

      if params.keys.include?('direct_message_events')
        params['direct_message_events'].each do |message|
          
          sender_id = message["message_create"]["sender_id"]

          text = message["message_create"]["message_data"]["text"]

          serialized_content = serialize_content(text)
          
          sender = params["users"][ message["message_create"]["sender_id"] ]
          
          recipient = params["users"][ 
            message["message_create"]["target"]["recipient_id"] 
          ]
          
          agent_required = nil

          if sender_id == params['for_user_id'] 
            agent_required = true
            twitter_user = recipient
          else
            twitter_user = sender
          end
  
          data = {
            properties: {
              name: sender["name"],
              twitter_id: twitter_user["id"]
            }
          }
          
          participant = app.app_users.where(
            "properties->>'twitter_id' = ?", twitter_user["id"]
          ).first

          ## todo: check user for this & previous conversation
          ## via twitter with the twitter user id
          participant = app.add_anonymous_user(data) if participant.blank?

          conversation = participant.conversations
          .joins(:conversation_source)
          .where("conversation_sources.app_package_integration_id =?", package.id)
          .first

          conversation = app.conversations.create(
            main_participant: participant,
            conversation_source_attributes:{
              app_package_integration: package
            } 
          ) unless conversation.present?

          conversation.add_message(
            from: agent_required ? Agent.first : participant,
            message: {
              html_content: text,
              serialized_content: serialized_content
            },
            check_assignment_rules: true
          )
        end
      end
    end

    def message_create_header(recipient_id)

      header = {}
  
      header['type'] = 'message_create'
      header['message_create'] = {}
      header['message_create']['target'] = {}
      header['message_create']['target']['recipient_id'] = "#{recipient_id}"
  
      header
  
    end

    def send_message(conversation, message)
      event = {}
      event['event'] = message_create_header(
        conversation.main_participant.properties['twitter_id']
      )

      plain_message = JSON.parse(
        message[:message][:serialized_content]
      )["blocks"].map{|o| o["text"]}.join("\r\n")
  
      message_data = {}
      message_data['text'] = plain_message
      event['event']['message_create']['message_data'] = message_data
      make_post_request("/1.1/direct_messages/events/new.json", event.to_json)
    end

    def generate_crc_response(consumer_secret, crc_token)
      hash = OpenSSL::HMAC.digest('sha256', consumer_secret, crc_token)
      return Base64.encode64(hash).strip!
    end

    def serialize_content(text)
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

  end

end
