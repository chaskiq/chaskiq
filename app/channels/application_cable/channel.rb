module ApplicationCable
  class Channel < ActionCable::Channel::Base

    def get_user_data
      if @app.encryption_enabled?
        @user_data = authorize_by_encrypted_params
      else
        @user_data = get_user_from_unencrypted
      end
    end

    def authorize_by_encrypted_params
      begin
        key = @app.encryption_key #"d2f5e36677eac3b5"
        encrypted = params[:enc_data]
        json = JWE.decrypt(encrypted, key)
        JSON.parse(json).symbolize_keys
      rescue 
        nil
      end
    end

    # non encrypted version
    def get_user_from_unencrypted
      begin
        params.slice(:email, :properties)
      rescue 
        nil
      end
    end


  end
end
