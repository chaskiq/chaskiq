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
      self.make_get_request("/1.1/account_activity/all/development/webhooks.json")
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

    def process_event(params)
      if params.keys.include?('direct_message_events')
        params['direct_message_events'].each do |message|
          
          message_text = message["message_create"]["message_data"]["text"]
          sender = params["users"][ message["message_create"]["sender_id"] ]
  
          sender_name = sender["name"]
          sender_twitter_id = sender["id"]
  
          response = {
            message_id: message["id"],
            message_text: message_text,
            sender: sender,
            sender_name: sender_name,
            sender_twitter_id: sender_twitter_id
          }.to_json
  
          puts response
  
          ## create conversation
  
        end
      end


    end

    def generate_crc_response(consumer_secret, crc_token)
      hash = OpenSSL::HMAC.digest('sha256', consumer_secret, crc_token)
      return Base64.encode64(hash).strip!
    end

  end

end
