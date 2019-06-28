

module DataEnrichmentService

  class FullContact < DataEnrichmentService::Base
    
    attr_accessor :authorization, :params, :conn, :token

    # initialize with 
    # DataEnrichmentService::FullContact.new(token: "122334456")

    # DataEnrichmentService::FullContact.new(token: token)
    # .get_data(params: {email: "miguelmichelson@gmail.com"})

    def initialize(token:)
      @conn = Faraday.new :request => { 
        :params_encoder => Faraday::FlatParamsEncoder 
      }
      @token = token
      self
    end

    def authorize!
      @conn.authorization :Bearer, @token
    end

    def get_data(params: {})
      authorize!
      response = @conn.post("https://api.fullcontact.com/v3/person.enrich") do |req|
        req.body = params.to_json
      end 

      JSON.parse(response.body, object_class: OpenStruct)
    end

  end
end