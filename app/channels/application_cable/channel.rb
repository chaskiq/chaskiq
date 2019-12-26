# frozen_string_literal: true

module ApplicationCable
  class Channel < ActionCable::Channel::Base
    def get_user_data
      #if params[:inner_app].present?
      #  user = authorize_by_jwt
      #  # self.connection.env['warden'].user
      #  user.class.model_name.singular
      #  @user_data = user.attributes.slice('email').symbolize_keys.merge(agent: true)
      #  return if @user_data.present?
      #end

      @user_data = if @app.encryption_enabled?
                     authorize_by_encrypted_params
                   else
                     get_user_from_unencrypted
                   end
    end

    def authorize_by_jwt
      token = params['jwt'].gsub('Bearer ', '')
      Warden::JWTAuth::UserDecoder.new.call(
        token, :agent, nil
      )
    end

    def authorize_by_encrypted_params
      key = @app.encryption_key # "d2f5e36677eac3b5"
      encrypted = params[:enc_data]
      json = JWE.decrypt(encrypted, key)
      JSON.parse(json).symbolize_keys
    rescue StandardError
      nil
    end

    def get_user_by_session
      @app.app_users.find_by(session_id: params[:session_id])
    end

    # non encrypted version
    def get_user_from_unencrypted
      params.slice(:email, :properties)
    rescue StandardError
      nil
    end
  end
end
