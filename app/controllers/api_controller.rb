# frozen_string_literal: true

class ApiController < ActionController::API
  include ActionController::Cookies

  private

  def get_user_data_from_auth
    # it will find the session from cookie
    # for now we will avoid this and only use the cookie as a session for subsequent requests
    # if @user_data = get_by_cookie_session
    #  set_locale
    #  handle_encrypted_auth
    # it will authorize by params passed on embed
    # elsif ...
    if @app.encryption_enabled?
      @user_data = authorize_by_encrypted_params
      @user_data = (identify_by_user_data || {}) if @user_data.blank?
      set_locale
      handle_encrypted_auth
    else
      # check this, maybe deprecate unsecure mode
      @user_data = get_user_from_unencrypted
    end

    @user_data
  end

  def cookie_id_namespace
    :"chaskiq_session_id_#{@app.key}"
  end

  def delete_session_cookie
    cookies.delete cookie_namespace,
                   expires: 1.week.ago,
                   value: nil,
                   path: "/"
  end

  def cookie_namespace
    :"chaskiq_ap_session_#{@app.key}"
  end

  def handle_encrypted_auth
    if @user_data.present? && @user_data[:email].present?
      app_user =  get_user_by_email ||
                  @app.add_user(email: @user_data[:email])

      merge_user_data(app_user)
      options = {
        properties: app_user.properties.merge(@user_data[:properties]),
        lang: I18n.locale
      }

      # set_session_cookie
      # binding.pry

      handle_user_merge

      app_user.update(options)
    else
      visitor = (get_user_by_session || add_vistor)
      visitor.update(lang: I18n.locale)
      merge_user_data(visitor.reload)
    end
  end

  def handle_user_merge
    # if app allow user auto merge
    c = request.headers["session-id"] # cookies[:"chaskiq_session_id_#{@app.key}"]

    return if c.blank?
    return if @app_user.session_id == c

    # merge user
    # do this in a job
    visitor = @app.app_users.find_by(session_id: c)
    return if visitor.blank?

    @app.merge_contact_async(from: visitor, to: @app_user)
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
                     get_by_cookie_session || identify_by_user_data || authorize_by_encrypted_params
                   else
                     get_user_from_unencrypted
                   end
  end

  def set_locale
    user_locale = begin
      @user_data[:properties].try(:[], :lang)
    rescue StandardError
      nil
    end

    locale = handle_locale_from_params(user_locale)

    I18n.locale = begin
      locale
    rescue StandardError
      I18n.locale
    end
  end

  def handle_locale_from_params(user_locale)
    return user_locale if lang_available?(user_locale)

    http_locale = request.headers["HTTP_LANG"]
    http_splitted_locale = http_locale ? http_locale.to_s.split("-").first.to_sym : nil

    return http_splitted_locale if lang_available?(http_splitted_locale)
    return http_locale if lang_available?(http_locale)

    nil
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

  def get_by_cookie_session
    session_value = request.headers["session-value"]
    @session_from_cookie = SessionFinder.get_by_cookie_session(session_value)
  end

  def get_user_by_session
    session_id = request.headers["HTTP_SESSION_ID"]
    return nil if session_id.blank?

    @app.get_non_users_by_session(session_id)
  end

  def identify_by_user_data
    data = request.headers["HTTP_USER_DATA"]
    data = begin
      JSON.parse(data)
    rescue StandardError
      nil
    end
    return nil if data.blank?
    return nil unless data.is_a?(Hash)
    return data&.with_indifferent_access if @app.compare_user_identifier(data)
  end

  def authorize_by_encrypted_params
    @app.decrypt(request.headers["HTTP_ENC_DATA"])
  end

  # non encrypted version
  def get_user_from_unencrypted
    JSON.parse(request.headers["HTTP_USER_DATA"]).deep_symbolize_keys
  rescue StandardError
    nil
  end

  def lang_available?(lang)
    return if lang.blank?

    I18n.available_locales.include?(lang.to_sym)
  end

  def valid_origin?
    OriginValidator.new(
      app: @app.domain_url,
      host: request.env["HTTP_ORIGIN"]
    ).is_valid?
  end

  def eu_location?
    return true
    eu_countries = EuCountries.includes?(request.location&.country_code)
  end
end
