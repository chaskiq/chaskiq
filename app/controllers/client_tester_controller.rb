require 'jwe'
require 'open-uri'
class ClientTesterController < ApplicationController

  before_action :set_lang_var

  layout "client"
  
  def show

    @app = get_app
    # open_uri("isReverse={true}")
    key = @app.encryption_key # SecureRandom.hex(8) o SecureRandom.random_bytes(16)
    # payload = "miguel@preyhq.com"

    @sessionless = params[:sessionless]

    @h = {
      http: Rails.env.production? ? 'https://' : 'http://',
      ws:   Rails.env.production? ? 'wss://' : 'ws://'
    }

    @json_payload = {
      #domain: @h[:http] + request.env["HTTP_HOST"],
      #ws: @h[:ws] + request.env["HTTP_HOST"]+ "/cable",
      #app_id: "#{@app.key}",
    }

    @json_payload.merge!(user_options) unless params[:sessionless]
    @json_payload = @json_payload.to_json

    @encrypted_data = JWE.encrypt(@json_payload, key, alg: 'dir')
  end

  def configured_lang
    params[:lang]
  end

  def set_lang_var
    @lang = configured_lang
  end

  def user_options
    { email: "test@test.cl",
      properties: {
        name: params[:name] || "miguel",
        lang: params[:lang] || "en",
        id: "localhost",
        country: "chile",
        role: params[:pro] || "admin",
        pro: params[:pro],
        plan: params[:plan] || 'pro',
      }
    } 
  end

  def get_app
    App.find_by(key: params[:id]) rescue App.first
  end
end
