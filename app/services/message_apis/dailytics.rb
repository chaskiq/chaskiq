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
      @report_id = config["report_id"]

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


    def get_stats
      data = get_report(@report_id)["data"]

      output = {
        
        "id": data["id"],
        "title": data["name"],
        "subtitle": data["periodicity"],
        attributes: {
          "ga_account_name": "VADB",
          "ga_web_property_name": "vadb.info",
          "ga_profile_name": "Todos los datos de sitios web"
          },

        values: [
          {label: "last_sessions", value: data["last_sessions"]} ,
          {label: "last_pageviews", value: data["last_pageviews"]} ,
          {label: "last_bounce_rate", value: data["last_bounce_rate"]} ,
          {label: "last_avg_session_duration", value: data["last_avg_session_duration"]} ,
          {label: "last_sessions_comparisson", value: data["last_sessions_comparisson"]} ,
          {label: "last_pageviews_comparisson", value: data["last_pageviews_comparisson"]} ,
          {label: "last_bounce_rate_comparisson", value: data["last_bounce_rate_comparisson"]} ,
          {label: "last_avg_session_duration_comparisson", value: data["last_avg_session_duration_comparisson"]}
        ]
      }


    end
  
  end
end
