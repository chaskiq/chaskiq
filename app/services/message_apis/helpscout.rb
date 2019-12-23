# frozen_string_literal: true

module MessageApis
  class Helpscout
    # https://developer.helpscout.com/mailbox-api/endpoints/customers/update/
    attr_accessor :key, :secret

    def initialize(key:, secret:)
      # @token = token

      @key = key
      @secret = secret

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
    end

    def self.tester
      MessageApis::Helpscout.new(
        key: Rails.application.credentials.integrations.dig(:helpscout, :key),
        secret: Rails.application.credentials.integrations.dig(:helpscout, :secret)
      )
    end

    def authorize_url
      "https://secure.helpscout.net/authentication/authorizeClientApplication?client_id=#{key}&state=#{secret}"
    end

    def get_token
      url = 'https://api.helpscout.net/v2/oauth2/token'
      data = {
        'grant_type' => 'client_credentials',
        'client_id' => @key,
        'client_secret' => @secret
      }
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = data.to_json
      end
      @access_token = JSON.parse(response.body, object_class: OpenStruct).access_token
    end

    def authorize!
      @conn.authorization :Bearer, @access_token
    end

    def create_conversation
      get_token

      url = 'https://api.helpscout.net/v2/conversations'

      data = {
        subject: 'Subject',
        customer: {
          email: 'bear@acme.com',
          firstName: 'Vernon',
          lastName: 'Bear'
        },
        mailboxId: 201_899,
        type: 'email',
        status: 'active',
        createdAt: '2012-10-10T12:00:00Z',
        threads: [{
          type: 'customer',
          customer: {
            email: 'bear@acme.com'
          },
          text: 'Hello, Help Scout. How are you?'
        }],
        tags: ['vip'],
        fields: [{
          id: 531,
          value: 'trial'
        }]
      }

      authorize!

      resp = @conn.post(url, data.to_json, 'Content-Type' => 'application/json')
    end

    def create_customer
      get_token

      url = 'https://api.helpscout.net/v2/customers'

      authorize!

      data = {
        firstName: 'Veroijoijoijnon',
        lastName: 'Bear',
        photoUrl: 'https://api.helpscout.net/img/some-avatar.jpg',
        photoType: 'twitter',
        jobTitle: 'CEO and Co-Founder',
        location: 'Greater Dallas/FT Worth Area',
        background: "I've worked with Vernon before and he's really great.",
        age: '30-35',
        gender: 'Male',
        organization: 'Acme, Inc',
        emails: [{
          type: 'work',
          value: 'bear@ackkme.com'
        }]
      }

      res = @conn.post(url, data.to_json, 'Content-Type' => 'application/json')
      puts res.body
      puts res.status
    end
  end
end
