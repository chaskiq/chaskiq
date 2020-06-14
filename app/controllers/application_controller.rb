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
    render status: 200, json: {ok: true}
  end
  
  def current_user
    current_resource_owner || warden.authenticate(:agent) rescue nil
  end

  def package_iframe
    response.headers.delete "X-Frame-Options"
    render "app_packages/#{params[:package]}/show", layout: false
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

  protected
  
  # Devise methods
  # Authentication key(:username) and password field will be added automatically by devise.
  def configure_permitted_parameters
    added_attrs = [:email, :first_name, :last_name]
    devise_parameter_sanitizer.permit :sign_up, keys: added_attrs
    devise_parameter_sanitizer.permit :account_update, keys: added_attrs
  end

  def set_locale
    http_locale = request.headers['HTTP_LANG'] || params[:lang] || cookies[:lang]
    http_splitted_locale = http_locale ? http_locale.to_s.split('-').first.to_sym : nil
    user_locale = begin
                    @user_data[:properties].try(:[], :lang)
                  rescue StandardError
                    nil
                  end

    locale = lang_available?(user_locale) ? user_locale :
    lang_available?(http_locale) ? http_locale :
    lang_available?(http_splitted_locale) ? http_splitted_locale : nil

    I18n.locale = begin
                    locale
                  rescue StandardError
                    I18n.locale
                  end
    cookies[:lang] = I18n.locale
  end

  private

  def lang_available?(lang)
    return unless lang.present?
    I18n.available_locales.include?(lang.to_sym)
  end

  def current_resource_owner
    if doorkeeper_token && !doorkeeper_token.expired?
      agent = Agent.find(doorkeeper_token.resource_owner_id) 
      sign_in(agent, scope: "agent")
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
