# frozen_string_literal: true

require "openssl"
OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app

  after_create :handle_registration
  before_destroy :unregister

  # possible names for api requirements,
  # it also holds a credentials accessor in which can hold a hash
  DEFAULT_ACCESSORS = %i[
    api_key
    api_secret
    endpoint_url
    project_id
    report_id
    access_token
    access_token_secret
    user_id
    user_token
    credentials
    verify_token
    sandbox
  ].freeze

  DB_ATTRIBUTES = %i[
    app_package_id
    app_id
    settings
    state
    created_at
    updated_at
    external_id
  ].freeze

  store :settings, accessors: DEFAULT_ACCESSORS, coder: JSON

  validate do
    app_package.definitions.each do |definition|
      next unless definition[:required]

      key = definition[:name].to_sym
      # next unless self.class.stored_attributes[:settings].include?(key)

      errors.add(key, "#{key} is required") if self[:settings][key].blank?
    end
  end

  validate :integration_validation, on: %i[create update]

  def integration_validation
    return if app_package.is_external?

    error_response = message_api_validations

    return if error_response.blank?

    error_response.each do |err|
      errors.add(:base, err)
    end
  end

  def message_api_validations
    return nil unless message_api_klass.respond_to?(:validate_integration)

    message_api_klass.validate_integration
  end

  def message_api_klass
    config = settings.dup.merge(package: self).merge(
      app_package.credentials || {}
    )

    @message_api_klass ||= if app_package.is_external?
                             ExternalApiClient.new(config: config)
                           else
                             "MessageApis::#{app_package.name}::Api".constantize.new(
                               config: config
                             )
                           end
    # rescue nil
  end

  def report(path, options = {})
    message_api_klass.report(
      path,
      self,
      options
    )
  end

  def merged_credentials; end

  def trigger(event)
    klass = message_api_klass
    klass.trigger(event) if klass.respond_to?(:trigger)
  end

  def handle_registration
    return if app_package.is_external?

    register_hook if message_api_klass && message_api_klass.respond_to?(:register_webhook)
    message_api_klass.after_install if message_api_klass.respond_to?(:after_install)
  end

  def register_hook
    klass = message_api_klass
    response = klass.register_webhook(app_package, self)
    klass.subscribe_to_events if klass.respond_to?(:subscribe_to_events)
    response
  end

  def unregister
    return if app_package.is_external?

    klass = message_api_klass
    klass.unregister(app_package, self) if klass.respond_to?(:unregister)
  end

  def get_webhooks
    klass = message_api_klass
    response = klass.get_webhooks
  end

  def delete_webhooks
    klass = message_api_klass
    response = klass.delete_webhooks
  end

  def create_hook_from_params(params)
    message_api_klass.create_hook_from_params(params, self)
  end

  def process_event(params)
    message_api_klass.enqueue_process_event(params, self)
  end

  delegate :send_message, to: :message_api_klass

  def oauth_authorize
    return if app_package.is_external?

    message_api_klass.oauth_authorize(app, self) if message_api_klass.respond_to?(:oauth_authorize)
  end

  def encoded_id
    URLcrypt.encode("#{app.key}+#{id}")
  end

  def self.decode(encoded)
    result = URLcrypt.decode(encoded).split("+")
    App.find_by(key: result.first).app_package_integrations.find(result.last)
  end

  def hook_url
    # host = 'https://chaskiq.ngrok.io'
    host = Chaskiq::Config.get("HOST")
    "#{host}/api/v1/hooks/receiver/#{encoded_id}"
  end

  def oauth_url
    "#{Chaskiq::Config.get('HOST')}/api/v1/oauth/callback/#{encoded_id}"
  end

  def receive_oauth_code(params)
    klass = message_api_klass.receive_oauth_code(params, self)
  end

  def get_presenter_manager
    "MessageApis::#{app_package.name}::Presenter"&.constantize
  rescue StandardError
    ExternalPresenterManager
  end

  def presenter
    @presenter ||= get_presenter_manager
  end

  def external_package?
    presenter == ExternalPresenterManager
  end

  # used in display
  def call_hook(params)
    # @presenter.submit_hook(params)
    params.merge!({ package: self }) if external_package?

    params[:ctx][:package] = self unless external_package?

    response = presenter_hook_response(params, presenter)&.with_indifferent_access

    validate_schema!(response[:definitions])

    if response["kind"] == "initialize"
      params[:ctx][:field] = nil
      params[:ctx][:values] = response["results"]
      response = presenter.initialize_hook(**params)
      response.merge!(kind: "initialize")
    end

    return response if response[:results].blank?

    if (message_key = params.dig(:ctx, :message_key)) && message_key.present?
      # TODO: maybe refactor this logic, move it to another place
      message = params.dig(:ctx, :package).app.conversation_parts.find_by(
        key: message_key
      )

      values = params[:ctx][:values]
      m = message.message
      blocks = m.blocks.merge("schema" => response[:definitions])
      m.blocks = blocks
      m.save_replied(response[:results])
    end

    response
  end

  def validate_schema!(definitions)
    package_schema = PluginSchemaValidator.new(definitions)
    raise "invalid definitions: #{package_schema.to_json}" unless package_schema.valid?
  end

  def presenter_hook_response(params, presenter)
    case params[:kind]
    when "initialize" then presenter.initialize_hook(**params)
    when "configure" then presenter.configure_hook(**params)
    when "submit" then presenter.submit_hook(**params)
    when "frame" then presenter.sheet_hook(**params)
    when "content" then presenter.content_hook(**params)
    else raise "no compatible hook kind"
    end
  end
end

class ExternalApiClient
  attr_accessor :config
  attr_reader :api_url

  def initialize(config:)
    @config  = config
    @api_url = config["package"].app_package.api_url
  end

  def trigger(event)
    data = event.as_json

    payload = {
      action: event.action,
      created_at: event.created_at,
      data: {
        subject: subject_data(event.eventable),
        properties: event.properties
      }
    }

    post(@api_url, payload)
  end

  def report(path, options = {})
    # post(@api_url)
  end

  def enqueue_process_event(params, integration)
    params.merge!({ package: integration.as_json })
    post(@api_url, params)
  end

  def conn
    # site = Addressable::URI.parse(@api_url).site
    # @conn ||= Faraday.new(:url => site , request: { timeout: 2 } ) do |faraday|
    @conn ||= Faraday.new(request: { timeout: 2 }) do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger
      faraday.adapter  Faraday.default_adapter
    end
  end

  def post(url, data)
    resp = conn.post(
      url,
      data.to_json,
      "Content-Type" => "application/json"
    )
    JSON.parse(resp.body)
  end

  def subject_data(eventable)
    case eventable.class
    when Conversation
      eventable.as_json(methods: %i[main_participant assignee latest_message]).to_json
    else
      eventable.to_json
    end
  end
end

class ExternalPresenterManager
  def self.post(url, data)
    # This it's just to restrict fields on app, refactor this!
    data[:ctx][:app] = data.dig(:ctx, :app).as_json(only: %i[key name])
    data[:ctx][:current_user] = data.dig(:ctx, :current_user).as_json(methods: %i[email kind display_name avatar_url])
    Rails.logger.debug url
    Rails.logger.debug data
    resp = Faraday.post(
      url,
      data.to_json,
      "Content-Type" => "application/json"
    )
    JSON.parse(resp.body)
  end

  def self.initialize_hook(data)
    url = data[:package].app_package.initialize_url
    post(url, data)
  end

  def self.configure_hook(data)
    url = data[:package].app_package.configure_url
    post(url, data)
  end

  def self.submit_hook(data)
    url = data[:package].app_package.submit_url
    post(url, data)
  end

  def self.sheet_hook(data)
    url = data[:package].app_package.sheet_url
    post(url, data)
  end

  def self.content_hook(data)
    url = data[:package].app_package.content_url
    post(url, data)
  end
end
