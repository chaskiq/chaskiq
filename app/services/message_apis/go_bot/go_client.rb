require "faraday"
require "json"

# client = MessageApis::GoBot::GoClient.new
# messages = [
#   { role: 'user', content: 'Hello!' },
#   { role: 'assistant', content: 'Hi there, how can I help you?' }
# ]
#

class MessageApis::GoBot::GoClient
  BASE_URL = Chaskiq::Config.get("CIENCE_GO_BOT_URL")

  def initialize
    @conn = Faraday.new(url: BASE_URL) do |faraday|
      faraday.request :json
      # faraday.use FaradayMiddleware::FollowRedirects
      faraday.adapter Faraday.default_adapter
    end
  end

  def initiate_conversation(messages)
    response = @conn.post("/conversation") do |req|
      req.headers["Content-Type"] = "application/json"
      req.headers["Accept"] = "text/event-stream"
      req.body = { messages: messages }
    end

    handle_response(response)
  end

  private

  def handle_response(response)
    case response.status
    when 200
      event_data = response.body.each_line.map do |line|
        data = line.strip.split(":", 2).last
        next if data.blank?

        # implement this with each not map
        # event = JSON.parse(data)
        # handle_event(event)

        data
      end
      handle_whole_event(event_data)
    when 400
      Rails.logger.debug { "Error response: #{response.body}" }
    else
      raise "Unexpected status code: #{response.status}"
    end
  end

  def handle_whole_event(event_data)
    formatted = "[#{event_data.compact.join(',')}]"
    JSON.parse(formatted).map do |event|
      event["choices"].map do |choice|
        choice["delta"]["content"]
      end
    end.join
  end

  def handle_event(event)
    event["choices"].each do |choice|
      Rails.logger.debug choice["delta"]["content"]
    end
  end
end
