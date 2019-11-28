module MessageApis
  class Slack 

    BASE_URL="https://slack.com"

    attr_accessor :key, :secret, :access_token

    def initialize(access_token:)
      @access_token = access_token
      @conn = Faraday.new :request => { 
        :params_encoder => Faraday::FlatParamsEncoder 
      }
    end

    def self.tester
      MessageApis::Slack.new(
        access_token: Rails.application.credentials.integrations.dig(:slack, :token)
      )
    end

    def authorize!
      @conn.authorization :Bearer, @access_token
    end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def post_message
      authorize!

      data = {
        "channel": Rails.application.credentials.integrations.dig(:slack, :channel),
        "text":"a new user ",
        "attachments":[
          {"text":"Who wins the lifetime supply of chocolate?",
            "fallback":"You could be telling the computer exactly what it can do with a lifetime supply of chocolate.",
            "color":"#3AA3E3",
            "attachment_type":"default",
            "callback_id":"select_simple_1234",
            "actions":[
              {"name":"winners_list",
                "text":"Who should win?",
                "type":"select",
                "data_source":"users"
              }]
            },
            blocks:	[{
              "type": "section", 
              "text": {"type": "plain_text", "text": "Hello world"}
            }]
      ]}

      url = url("/api/chat.postMessage")
      
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end

      puts response.body
      puts response.status
    end

    def create_channel

      authorize!

      data = {
        "name": "chaskiq_channel"
      }

      url = url("/api/channels.create")
      
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end

      puts response.body
      puts response.status

    end
  end
end