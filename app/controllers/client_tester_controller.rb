# frozen_string_literal: true

require 'jwe'
require 'open-uri'
class ClientTesterController < ApplicationController
  before_action :set_lang_var

  before_action :authenticate_agent!, if: ->{!Rails.env.test?}

  layout 'client'

  def show
    @app = get_app
    key = @app.encryption_key
    @sessionless = params[:sessionless]

    @h = {
      http: Rails.env.production? ? 'https://' : 'http://',
      ws: Rails.env.production? ? 'wss://' : 'ws://'
    }

    @json_payload = {}

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
    { email: 'test@test.cl',
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
  end

  def get_app
    App.find_by(key: params[:id])
  rescue StandardError
    App.first
  end
end
