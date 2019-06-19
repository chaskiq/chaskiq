require 'jwe'
require 'open-uri'
class ClientTesterController < ApplicationController

  layout "client"
  
  def show

    # open_uri("isReverse={true}")
    key = get_app.encryption_key # SecureRandom.hex(8) o SecureRandom.random_bytes(16)
    # payload = "miguel@preyhq.com"

    @h = {
      http: Rails.env.production? ? 'https://' : 'http://',
      ws:   Rails.env.production? ? 'wss://' : 'ws://'
    }

    @json_payload = {
      domain: @h[:http] + request.env["HTTP_HOST"],
      ws: @h[:ws] + request.env["HTTP_HOST"]+ "/cable",
      app_id: "#{get_app.key}",
      email: "test@test.cl",
      properties: {
                    name: "miguel",
                    lang: "es",
                    id: "localhost",
                    country: "chile",
                    role: "admin",
                    pro: true
                  }
    }.to_json
    @encrypted_data = JWE.encrypt(@json_payload, key, alg: 'dir')
  end

  def get_app
    App.find_by(key: params[:id]) rescue App.first
  end
end
