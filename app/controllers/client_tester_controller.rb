# frozen_string_literal: true

require 'jwe'
require 'open-uri'
require 'openssl'
require 'base64'

class ClientTesterController < ApplicationController
  before_action :set_lang_var

  before_action :authenticate_agent!, if: -> { !Rails.env.test? }

  layout 'client'

  def show
    @app = get_app
    @sessionless = params[:sessionless]
    @json_payload = {}
    @h = endpoints
    @json_payload.merge!(user_options) unless params[:sessionless]

    @encrypted_data = if params[:jwt].present?
      t = JWE.encrypt(@json_payload.to_json, @app.encryption_key, alg: 'dir')
      t = "\'#{t}\'"
    else
      @json_payload.to_json
    end
    
  end

  def configured_lang
    params[:lang]
  end

  def set_lang_var
    @lang = configured_lang
  end

  def user_options
    key = @app.encryption_key
    email = 'test@test.cl'
    options = { 
      email: email,
      properties: {
        name: params[:name] || 'miguel',
        lang: params[:lang] || 'en',
        id: 'localhost',
        country: params[:country] || 'chile',
        role: params[:pro] || 'admin',
        pro: params[:pro],
        num_devices: params[:num_devices].nil? ? 2 : params[:num_devices].to_i,
        plan: params[:plan] || 'pro',
        last_sign_in: params[:last_sign_in] || 2.days.ago
      } }
      options.merge!({
        identifier_key: OpenSSL::HMAC.hexdigest('sha256', key, email),
      }) if params[:jwt].blank?
      options
  end

  def endpoints
    {
      http: Rails.env.production? ? 'https://' : 'http://',
      ws: Rails.env.production? ? 'wss://' : 'ws://'
    }
  end

  def get_app
    App.find_by(key: params[:id])
  rescue StandardError
    App.first
  end
end
