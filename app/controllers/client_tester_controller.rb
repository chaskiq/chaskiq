require 'jwe'
class ClientTesterController < ApplicationController

  layout "client"
  
  def show
    key = App.last.encryption_key # SecureRandom.hex(8) o SecureRandom.random_bytes(16)
    # payload = "miguel@preyhq.com"
  
    json_payload = {
      domain: "#{Rails.application.routes.default_url_options[:host]}",
      ws: "#{Rails.application.config.action_cable.url}",
      app_id: "#{App.first.key}",
      name: "miguel",
      email: "miguel@preyhq.com",
      properties: {
                    id: "localhost",
                    country: "chile"
                  }
    }.to_json
    @encrypted_data = JWE.encrypt(json_payload, key, alg: 'dir')
  end
end
