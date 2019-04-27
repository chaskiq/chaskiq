require 'jwe'
class ClientTesterController < ApplicationController

  layout "client"
  
  def show
    key = App.first.encryption_key # SecureRandom.hex(8) o SecureRandom.random_bytes(16)
    # payload = "miguel@preyhq.com"

    @json_payload = {
      domain: "http://" + request.env["HTTP_HOST"],
      ws: "ws://" + request.env["HTTP_HOST"]+ "/cable",
      app_id: "#{App.first.key}",
      name: "miguel",
      email: "miguel@preyhq.com",
      properties: {
                    lang: "es",
                    id: "localhost",
                    country: "chile",
                    role: "admin",
                    pro: true
                  }
    }.to_json
    @encrypted_data = JWE.encrypt(@json_payload, key, alg: 'dir')
  end
end
