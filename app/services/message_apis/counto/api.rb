# frozen_string_literal: true

module MessageApis::Counto
  class Api
    attr_accessor :secret

    def initialize(config:)
      @secret = secret
      @api_key = config["api_key"]
      @url = config["endpoint_url"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        "Content-Type" => "application/json"
      }
    end

    def notify_conversation_part(conversation_part:, command:)
      info = begin
        JSON.parse(command)
      rescue StandardError
        nil
      end

      company_name = info["company_name"]
      conversation_part.authorable.update(company_name: company_name) if company_name

      user = conversation_part.conversation.main_participant.reload.as_json(
        methods: %i[company_name display_name email]
      )

      data = {
        data: JSON.parse(command),
        conversation_key: conversation_part.conversation.key,
        participant: user,
        serialized_content: JSON.parse(conversation_part.message.serialized_content)
      }
      response = @conn.post(@url.to_s, data.to_json)
      { body: response.body, status: response.status }
    end
  end
end
