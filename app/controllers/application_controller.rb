# frozen_string_literal: true

class ApplicationController < ActionController::Base
  respond_to :json, :html
  protect_from_forgery unless: -> { request.format.json? }
  # protect_from_forgery with: :null_session

  layout :layout_by_resource

  def preview
    @app = App.find_by(key: params[:app])
    @campaign = @app.campaigns.find(params[:id])
    # render plain: "hello"
    render 'campaigns/iframe', layout: false
  end

  def dummy_webhook
    render status: 200, json: { ok: true }
  end

  def current_user
    current_resource_owner || warden.authenticate(:agent)
  rescue StandardError
    nil
  end

  def authorize_by_encrypted_params
    @app.decrypt(request.headers['HTTP_ENC_DATA'])
  end

  def cookie_namespace
    "chaskiq_session_id_#{@app.key.gsub('-', '')}".to_sym
  end

  def package_iframe
    data = JSON.parse(params[:data])
    @app = App.find_by(key: data['data']['app_id'])

    url_base = data['data']['field']['action']['url']
    url = if url_base.match(%r{^/package_iframe_internal/})
            "#{ENV['HOST']}#{url_base}"
          else
            url_base
          end
    # TODO: unify this with the API auth
    begin
      user_data = @app.decrypt(data['data']['enc_data'])
      app_user = if user_data.present? && user_data[:email].present?
                   @app.app_users.users.find_by(email: user_data[:email])
                 else
                   @app.app_users.find_by(
                     session_id: cookies[cookie_namespace]
                   )
                 end
    rescue StandardError
      app_user = @app.app_users.find_by(
        session_id: cookies[cookie_namespace]
      )
    end

    app_user.as_json(methods: %i[
                       email
                       name
                       display_name
                       avatar_url
                       first_name
                       last_name
                     ])

    resp = Faraday.post(url,
                        data.merge!(user: app_user).to_json,
                        'Content-Type' => 'application/json')

    response.headers.delete 'X-Frame-Options'
    render html: resp.body.html_safe, layout: false
    # render "app_packages/#{params[:package]}/show", layout: false
  end

  def package_iframe_internal
    # TODO: securize this:
    # validate convesation_key & message_key
    # if params['conversation_id']
    #  conversation = Conversation.find_by(key: params['conversation_key'])
    #  app = conversation.app
    # else

    app = AppUser.find(params[:user]['id']).app
    # end

    presenter = app.app_package_integrations
                   .joins(:app_package)
                   .find_by("app_packages.name": params['package'])
                   .presenter

    opts = {
      app_key: app.key,
      user: params[:user],
      field: params.dig(:data, :field),
      values: params.dig(:data, :values)
    }

    opts.merge!({
                  conversation_key: params.dig(:data, :conversation_key),
                  message_key: params.dig(:data, :message_key)
                })

    html = presenter.sheet_view(opts)

    response.headers.delete 'X-Frame-Options'

    render html: html.html_safe, layout: false
  end

  def render_empty
    render html: '', layout: 'application'
  end

  def user_session
    render json: { current_user: {
      email: current_user.email
    } }
  end

  def catch_all
    render_empty
  end

  # Devise code
  before_action :configure_permitted_parameters, if: :devise_controller?

  def enabled_subscriptions?
    ENV['PADDLE_PUBLIC_KEY'].present? &&
      ENV['PADDLE_VENDOR_ID'].present? &&
      ENV['PADDLE_SECRET_TOKEN'].present?
  end

  helper_method :enabled_subscriptions?

  protected

  # Devise methods
  # Authentication key(:username) and password field will be added automatically by devise.
  def configure_permitted_parameters
    added_attrs = %i[email first_name last_name]
    devise_parameter_sanitizer.permit :sign_up, keys: added_attrs
    devise_parameter_sanitizer.permit :account_update, keys: added_attrs
  end

  def set_locale
    http_locale = request.headers['HTTP_LANG']
    http_splitted_locale = http_locale ? http_locale.to_s.split('-').first.to_sym : nil

    locale = if lang_available?(http_splitted_locale)
               http_splitted_locale
             else
               I18n.default_locale
             end

    I18n.locale = begin
      locale
    rescue StandardError
      I18n.default_locale
    end
  end

  private

  def lang_available?(lang)
    return unless lang.present?

    I18n.available_locales.include?(lang.to_sym)
  end

  def current_resource_owner
    if doorkeeper_token && !doorkeeper_token.expired?
      agent = Agent.find(doorkeeper_token.resource_owner_id)
      sign_in(agent, scope: 'agent')
      agent
    end
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

  def layout_by_resource
    if devise_controller?
      'devise'
    else
      'application'
    end
  end
end
