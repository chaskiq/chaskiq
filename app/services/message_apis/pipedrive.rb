module MessageApis
  class Pipedrive 
    # https://developers.pipedrive.com/docs/api/v1/
    BASE_URL="https://api.pipedrive.com/v1"

    attr_accessor :secret

    def initialize(secret:)
      @secret = secret 

      @conn = Faraday.new :request => { 
        :params_encoder => Faraday::FlatParamsEncoder 
      }
    end

    def url(url)
      "#{BASE_URL}#{url}?api_token=#{@secret}"
    end

    def self.tester
      MessageApis::Pipedrive.new(
        secret: Rails.application.credentials.integrations.dig(:pipedrive, :secret)
      )
    end
    
    def create_customer
        url = url("/persons")
        data = {
          "name": "jojoijoji michelson m",
          "email": "miguejoijolmichelson@gmail.com",
          "phone": "0992302305",
          "visible_to": "3"
        }
        response = @conn.post do |req|
          req.url url
          req.headers['Content-Type'] = 'application/json'
          req.body = data.to_json
        end
    end

  end
end