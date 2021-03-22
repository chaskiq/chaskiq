# frozen_string_literal: true

class ApplicationController < ActionController::Base
  respond_to :json, :html
  protect_from_forgery unless: -> { request.format.json? }
  include PackageIframeBehavior
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

  def layout_by_resource
    if devise_controller?
      'devise'
    else
      'application'
    end
  end
end
