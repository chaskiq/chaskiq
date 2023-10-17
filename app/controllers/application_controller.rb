# frozen_string_literal: true

class ApplicationController < ActionController::Base
  respond_to :json, :html
  protect_from_forgery unless: -> { request.format.json? }
  include PackageIframeBehavior
  # protect_from_forgery with: :null_session
  before_action :set_locale
  before_action :set_darkmode

  layout :layout_by_resource

  def preview
    @app = App.find_by(key: params[:app])
    @campaign = @app.campaigns.find(params[:id])
    # render plain: "hello"
    render "campaigns/iframe", layout: false
  end

  def find_app
    @app = current_agent.apps.find_by(key: params[:app_id])
  end

  def dummy_webhook
    render status: :ok, json: { ok: true }
  end

  def current_user
    return auth0_resource if auth0_enabled?

    current_resource_owner || warden.authenticate(:agent)
  rescue StandardError
    nil
  end

  def authorize_by_encrypted_params
    @app.decrypt(request.headers["HTTP_ENC_DATA"])
  end

  def cookie_namespace
    "chaskiq_session_id_#{@app.key.gsub('-', '')}".to_sym
  end

  def render_empty
    render html: "", layout: "application"
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
    stripe_subscriptions? || paddle_subscriptions?
  end

  def stripe_subscriptions?
    Chaskiq::Config.get("STRIPE_PRIVATE_KEY").present?
  end

  def paddle_subscriptions?
    (Chaskiq::Config.get("PADDLE_PUBLIC_KEY").present? &&
      Chaskiq::Config.get("PADDLE_VENDOR_ID").present? &&
      Chaskiq::Config.get("PADDLE_SECRET_TOKEN").present?)
  end

  def auth0_enabled?
    Chaskiq::Config.get("AUTH0_ENABLED") == "true"
  end

  def modal_close
    render turbo_stream: [
      turbo_stream.replace(
        "modal",
        partial: "shared/modal"
      )
    ]
  end

  def languages
    agent_param = params.dig(:agent, :lang)
    if agent_param && set_lang_for_agent(agent_param)
      cookies[:lang] = agent_param
      redirect_back(fallback_location: root_path) and return
    end
    render partial: "shared/languages"
  end

  helper_method :enabled_subscriptions?
  helper_method :paddle_subscriptions?
  helper_method :stripe_subscriptions?
  helper_method :auth0_enabled?

  protected

  # Devise methods
  # Authentication key(:username) and password field will be added automatically by devise.
  def configure_permitted_parameters
    added_attrs = %i[email first_name last_name]
    devise_parameter_sanitizer.permit :sign_up, keys: added_attrs
    devise_parameter_sanitizer.permit :account_update, keys: added_attrs
  end

  def set_darkmode
    cookies[:darkmode] ||= "light"
  end

  def set_locale
    locale = if cookies[:lang]
               cookies[:lang]
             elsif current_agent&.lang
               cookies[:lang] = current_agent.lang
               current_agent.lang
             elsif lang_available?(http_splitted_locale)
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

  def http_splitted_locale
    http_locale = request.headers["HTTP_LANG"]
    http_locale ? http_locale.to_s.split("-").first.to_sym : nil
  end

  def lang_available?(lang)
    return false if lang.blank?

    I18n.available_locales.include?(lang.to_sym)
  end

  def auth0_resource
    if (token = request.headers["Authorization"].split&.last) && token.present?
      @agent ||= AuthIdentity.find_agent_from_token(token)
      if @agent
        sign_in(@agent, scope: "agent")
        @agent
      end
    end
  end

  def set_lang_for_agent(lang)
    return unless lang_available?(lang)

    current_agent.update(lang: lang)
    I18n.locale = lang
  end

  def current_resource_owner
    if doorkeeper_token && !doorkeeper_token.expired?
      agent = Agent.find(doorkeeper_token.resource_owner_id)
      sign_in(agent, scope: "agent")
      agent
    end
  end

  def layout_by_resource
    # return false if turbo_frame_request?

    if devise_controller?
      "devise"
    else
      # "hotwire"
      "application"
    end
  end

  def set_settings_navigator
    @navigator = "apps/settings/navigator"
  end

  def flash_stream
    turbo_stream.replace("flash", partial: "shared/flash", locals: { flash: flash })
  end

  # messenger auth. we could use another app controller to get rig of logic that we don't need

  def authorize_messenger
    @app = App.find_by(key: params[:messenger_id])
    @app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])
  end

  def messenger_user
    @app_user
  end

  helper_method :flash_stream
  helper_method :messenger_user
end
