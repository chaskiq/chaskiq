# frozen_string_literal: true

module DataEnrichmentService
  class FullContact < DataEnrichmentService::Base
    attr_accessor :authorization, :params, :conn, :token

    # initialize with
    # DataEnrichmentService::FullContact.new(token: "122334456")

    # DataEnrichmentService::FullContact.new(token: token)
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
      response = @conn.post('https://api.fullcontact.com/v3/person.enrich') do |req|
        req.body = params.to_json
      end

      JSON.parse(response.body, object_class: OpenStruct)
    end

    def enrich_user(user)
      response = get_data(params: {
                            email: user.email,
                            macromeasures: true
                          })

      # means an error, escape it
      return if response.status.present? && response.status >= 400

      full_name = response.fullName
      user.name = full_name
      user.first_name = full_name.split(' ')[0]
      user.last_name  = full_name.split(' ')[1]
      user.twitter    = response.twitter
      user.facebook   = response.facebook
      user.linkedin   = response.linkedin
      user.organization = response.organization
      user.job_title = response.title
      user.save
    end
  end
end
