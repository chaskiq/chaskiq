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

      klass = "MessageApis::#{provider.to_s.camelize}"::Api.constantize
      klass.new(token: token)
    end

    def get_data(params: {})
      Rails.logger.info "enrichment service: not implemented"
    end
  end
end
