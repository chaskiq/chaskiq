# frozen_string_literal: true

module DataEnrichmentService
  class Base
    def initialize(provider:, token:)
      # conn.authorization :Bearer, 'mF_9.B5f-4.1JqM'
      #   conn.headers['Authorization']
      #   # => "Bearer mF_9.B5f-4.1JqM"
      #
      #   conn.authorization :Token, token: 'abcdef', foo: 'bar'
      #   conn.headers['Authorization']
      #   # => "Token token=\"abcdef\",
      #               foo=\"bar\""

      @token = token

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      klass = "DataEnrichmentService::#{provider.to_s.camelize}".constantize
      k = klass.new(token: token)
      k
    end

    def get_data(params: {})
      puts 'not implemented'
    end
  end
end
