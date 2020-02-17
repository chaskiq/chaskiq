# frozen_string_literal: true

module MessageApis
  class Dailytics
    # https://dailytics.com/
    BASE_URL = 'https://dailytics.com/api/v1/'
    # https://dailytics.com/api/v1/reports
    # https://dailytics.com/api/v1/reports/:id

    attr_accessor :secret

    def initialize(config:)
      @secret = secret

      @api_key   = config["api_key"] 
      @api_token = config["api_secret"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = { 
        'Content-Type'=> 'application/json'
      }
    end

    def url(url)
      "#{BASE_URL}#{url}?app=#{@api_key}&access_token=#{@api_token}"
    end

    def trigger(event)
    end

    def get_reports
      url = url("/reports")
      response = @conn.get(url, nil )
      JSON.parse(response.body)
    end

    def get_report(id)
      url = url("/reports/#{id}")
      response = @conn.get(url, nil )
      JSON.parse(response.body)
    end
  
  end
end
