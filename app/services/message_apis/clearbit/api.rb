# frozen_string_literal: true

module MessageApis::Clearbit
  class Api < DataEnrichmentService::Base
    attr_accessor :authorization, :params, :conn, :token

    URL = "https://person.clearbit.com/v2/combined/find"

    # initialize with
    # MessageApis::Clearbit::Enrichment.new(token: "122334456")

    # DataEnrichmentService::ClearbitEnrichment.new(token: token)
    # .get_data(params: {email: "miguelmichelson@gmail.com"})

    def initialize(token:)
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
      @token = token
      self
    end

    def self.definition_info
      {
        name: "Clearbit",
        tag_list: ["enrichment"],
        description: "Clearbit data enrichment",
        icon: "https://logo.clearbit.com/clearbit.com",
        state: "disabled",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      }
    end

    def authorize!
      @conn.request :authorization, :Bearer, @token
    end

    def get_data(params: {})
      authorize!
      response = @conn.get(URL, params)
      JSON.parse(response.body, object_class: OpenStruct)
    end
  end
end
