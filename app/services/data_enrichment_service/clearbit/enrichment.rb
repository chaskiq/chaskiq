# frozen_string_literal: true

module DataEnrichmentService
  class Clearbit::Enrichment < DataEnrichmentService::Base
    attr_accessor :authorization, :params, :conn, :token

    URL = 'https://person.clearbit.com/v2/combined/find'

    # initialize with
    # DataEnrichmentService::Clearbit::Enrichment.new(token: "122334456")

    # DataEnrichmentService::ClearbitEnrichment.new(token: token)
    # .get_data(params: {email: "miguelmichelson@gmail.com"})

    def initialize(token:)
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
      @token = token
      self
    end

    def authorize!
      @conn.authorization :Bearer, @token
    end

    def get_data(params: {})
      authorize!
      response = @conn.get(URL, params)
      JSON.parse(response.body, object_class: OpenStruct)
    end
  end
end
