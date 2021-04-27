# frozen_string_literal: true

module MessageApis::Counto
  class Api

    attr_accessor :secret

    def initialize(config:)
      @secret = secret
      @api_key   = config['api_key']
      @url = config['endpoint_url']

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        'Content-Type' => 'application/json'
      }
    end

    def notify_conversation_part(conversation_part:, command: )
      data = {
        command: JSON.parse(command),
        conversation_key: conversation_part.conversation.key,
        participant: conversation_part.conversation.main_participant,
        serialized_content: JSON.parse(conversation_part.message.serialized_content)
      }
      @conn.post("#{@url}/api", data.to_json)
    end
  end
end
