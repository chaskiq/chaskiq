class ApiController < ActionController::API

  #TODO : implementar esto
  # esto debe ser solo para api (y con checkeo de referrer)
  #before_action :cors_preflight_check
  ##before_action :cors_set_access_control_headers

private

  def get_user_data_from_auth
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params

      set_locale

      if @user_data.present? && @user_data[:email].present?        
        app_user = get_user_by_email || @app.add_user(email: @user_data[:email] )
        merge_user_data(app_user)
        app_user.update(
          properties: @user_data[:properties], 
          lang: I18n.locale 
        )
      else
        visitor = (get_user_by_session || add_vistor)
        visitor.update(lang: I18n.locale)
        merge_user_data(visitor.reload)
      end


    else
      # check this, maybe deprecate unsecure mode
      @user_data = get_user_from_unencrypted
    end
    
    @user_data
  end

  def merge_user_data(model)
    @user_data.merge!({
        session_id: model.session_id, 
        lang: I18n.locale, 
        kind: model.type,
        new_messages: model.new_messages.value
      }
    )
  end

  def get_user_data
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params
    else
      @user_data = get_user_from_unencrypted
    end
  end

  def set_locale
    I18n.locale = request.headers["HTTP_LANG"] unless request.headers["HTTP_LANG"].blank? rescue I18n.locale
    lang = @user_data[:properties].try(:[], :lang) rescue nil
    I18n.locale = lang unless lang.blank? rescue I18n.locale   
  end

  def add_vistor
    options = {} #{app_id: @app.key}
    #options.merge!({session_id: request.headers["HTTP_SESSION_ID"]}) 
    u = @app.add_anonymous_user(options)
  end

  def get_app_user
    get_user_by_email || get_user_by_session
  end

  def get_user_by_email
    return nil if get_user_data[:email].blank?
    @app.app_users.users.find_by(email: get_user_data[:email]) 
  end

  def get_user_by_session
    session_id = request.headers["HTTP_SESSION_ID"]
    return nil if session_id.blank?
    @app.app_users.where(type: ["Visitor", "Lead"]).find_by(session_id: session_id)
  end

  def authorize!
    render json: {}, status: 406 and return if @user_data.blank?
  end

  def authorize_by_encrypted_params
    begin
      key = @app.encryption_key
      encrypted = request.headers["HTTP_ENC_DATA"]
      json = JWE.decrypt(encrypted, key)
      JSON.parse(json).deep_symbolize_keys
    rescue 
      {}
    end
  end

  # non encrypted version
  def get_user_from_unencrypted
    begin
      JSON.parse(request.headers["HTTP_USER_DATA"]).deep_symbolize_keys
    rescue 
      nil
    end
  end

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render :text => '', :content_type => 'text/plain'
    end
  end

end