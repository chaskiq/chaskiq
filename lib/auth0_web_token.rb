# frozen_string_literal: true

require "net/http"
require "uri"

class Auth0WebToken
  def self.verify(token)
    JWT.decode(token, nil,
               true, # Verify the signature of this token
               algorithms: "RS256",
               iss: "https://#{Chaskiq::Config.get('AUTH0_DOMAIN')}/",
               verify_iss: true,
               aud: Chaskiq::Config.get("AUTH0_AUDIENCE"),
               verify_aud: true) do |header|
      jwks_hash[header["kid"]]
    end
  end

  def self.jwks_hash
    jwks_raw = Net::HTTP.get URI("https://#{Chaskiq::Config.get('AUTH0_DOMAIN')}/.well-known/jwks.json")
    jwks_keys = Array(JSON.parse(jwks_raw)["keys"])
    jwks_keys
      .to_h do |k|
        [
          k["kid"],
          OpenSSL::X509::Certificate.new(
            Base64.decode64(k["x5c"].first)
          ).public_key
        ]
      end
  end
end
