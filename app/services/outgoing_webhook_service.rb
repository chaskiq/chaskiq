class OutgoingWebhookService

  def initialize(url:)
    @url = url

    @conn = Faraday.new request: {
      params_encoder: Faraday::FlatParamsEncoder
    }
  end

  def send_post(data)
    response = @conn.post(@url, 
      data.to_json, 
      {'Content-Type'=>'application/json'})
    response.status
  end

end