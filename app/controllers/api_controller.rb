# frozen_string_literal: true

class ApiController < ActionController::API
  # TODO : implementar esto
  # esto debe ser solo para api (y con checkeo de referrer)
  # before_action :cors_preflight_check
  # #before_action :cors_set_access_control_headers

  private

  def get_user_data_from_auth
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params

      set_locale

      if @user_data.present? && @user_data[:email].present?
        app_user = get_user_by_email || @app.add_user(email: @user_data[:email])
        merge_user_data(app_user)
        app_user.update(
          properties: app_user.properties.merge(@user_data[:properties]),
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
    @user_data.merge!(
      session_id: model.session_id,
      lang: I18n.locale,
      kind: model.type,
      new_messages: model.new_messages.value
    )
  end

  def get_user_data
    @user_data ||= if @app.encryption_enabled?
                     authorize_by_encrypted_params
                   else
                     get_user_from_unencrypted
                   end
  end

  def set_locale
    http_locale = request.headers['HTTP_LANG']
    http_splitted_locale = http_locale ? http_locale.to_s.split('-').first.to_sym : nil
    user_locale = begin
      @user_data[:properties].try(:[], :lang)
    rescue StandardError
      nil
    end

    locale = if lang_available?(user_locale)
               user_locale
             elsif lang_available?(http_locale)
               http_locale
             else
               lang_available?(http_splitted_locale) ? http_splitted_locale : nil
             end

    I18n.locale = begin
      locale
    rescue StandardError
      I18n.locale
    end
  end

  def add_vistor
    options = {} # {app_id: @app.key}
    # options.merge!({session_id: request.headers["HTTP_SESSION_ID"]})
    u = @app.add_anonymous_user(options)
  end

  class EULocationError < StandardError; end

  def get_app_user
    valid_origin?
    # raise EULocationError.new("GDPR consent needed") if eu_location?
    @app_user ||= get_user_by_email || get_user_by_session
  end

  def get_user_by_email
    return nil if get_user_data[:email].blank?

    @app.get_app_user_by_email(get_user_data[:email])
  end

  def valid_origin?
    OriginValidator.new(
      app: @app.domain_url,
      host: request.env['HTTP_ORIGIN']
    ).is_valid?
  end

  def eu_location?
    return true
    eu_countries = %w[
      DE AT BE BG CY HR DK ES EE FI FR GR HU IE
      IT LV LT LU MT NL PL PT CZ RO GB SK SI SE
    ].include?(request.location&.country_code)
  end

  def get_user_by_session
    session_id = request.headers['HTTP_SESSION_ID']
    return nil if session_id.blank?

    @app.get_non_users_by_session(session_id)
  end

  # THIS IS NOT BEIGN USED?
  def authorize_user_data!
    render(json: {}, status: 406) && return if @user_data.blank?
  end

  def authorize_by_encrypted_params
    @app.decrypt(request.headers['HTTP_ENC_DATA'])
  end

  # non encrypted version
  def get_user_from_unencrypted
    JSON.parse(request.headers['HTTP_USER_DATA']).deep_symbolize_keys
  rescue StandardError
    nil
  end

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = '1728000'
  end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render text: '', content_type: 'text/plain'
    end
  end

  def lang_available?(lang)
    return if lang.blank?

    I18n.available_locales.include?(lang.to_sym)
  end
end
