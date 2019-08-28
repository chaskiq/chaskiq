class ApiController < ActionController::API

  #TODO : implementar esto
  # esto debe ser solo para api (y con checkeo de referrer)
  #before_action :cors_preflight_check
  ##before_action :cors_set_access_control_headers

private

  def get_user_data_from_auth
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params
      if @user_data[:email].blank?
        visitor = (get_user_by_session || add_vistor)
        @user_data.merge!({session_id: visitor.session_id}) 
      end
    else
      @user_data = get_user_from_unencrypted
    end
    @user_data
  end

  def get_user_data
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params
    else
      @user_data = get_user_from_unencrypted
    end
  end

  def add_vistor
    options = {} #{app_id: @app.key}
    #options.merge!({session_id: request.headers["HTTP_SESSION_ID"]}) 
    if @user_data[:email].blank?
      u = @app.add_anonymous_user(options)
    end

  end

  def get_app_user
    get_user_by_email || get_user_by_session
  end

  def get_user_by_email
    return nil if get_user_data[:email].blank?
    @app.app_users.find_by(email: get_user_data[:email]) 
  end

  def get_user_by_session
    session_id = request.headers["HTTP_SESSION_ID"]
    return nil if session_id.blank?
    @app.app_users.find_by(session_id: session_id)
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
      nil
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