# frozen_string_literal: true

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # config.hosts << "dea224b3.ngrok.io"
  config.hosts = nil # << "/[a-z0-9]+\.chaskiq.test:3000/"

  # Do not eager load code on boot.
  config.eager_load = false

  config.cache_store = :redis_cache_store

  # Show full error reports.
  config.consider_all_requests_local = true

  config.action_mailer.preview_path = "#{Rails.root}/spec/mailers/previews"

  host = ENV.fetch('HOST') { 'http://localhost:3000' }
  ws   = ENV.fetch('WS') { 'ws://locahost:3000/cable' }

  Rails.application.routes.default_url_options = { host: host }
  config.action_controller.default_url_options = { host: host }
  config.action_mailer.default_url_options = { host: host }
  config.action_controller.asset_host = host

  # config.action_cable.url = "ws://localhost:3334/cable"
  config.action_cable.url = ws
  config.action_cable.allowed_request_origins = [host, 'http://127.0.0.1:3000']

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join('tmp', 'caching-dev.txt').exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  config.log_level = :debug

  # Raises error for missing translations.
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  delivery_method = ENV.fetch('SMTP_DELIVERY_METHOD', 'ses')

  if delivery_method.downcase == 'smtp'
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address: ENV['SMTP_ADDRESS'],
      user_name: ENV['SMTP_USERNAME'], # Your SMTP user here.
      password: ENV['SMTP_PASSWORD'], # Your SMTP password here.
      authentication: :login,
      enable_starttls_auto: true
    }
  else
    zone = ENV['AWS_S3_REGION']

    creds = Aws::Credentials.new(
      ENV['AWS_ACCESS_KEY_ID'],
      ENV['AWS_SECRET_ACCESS_KEY']
    )

    Aws::Rails.add_action_mailer_delivery_method(
      :ses,
      credentials: creds,
      region: zone
    )

    config.action_mailer.delivery_method = :ses
  end

  config.action_mailer.perform_deliveries = false
  config.action_mailer.raise_delivery_errors = true


  # ACTIVE JOB
  config.active_job.queue_adapter = :sidekiq
  # config.active_job.queue_adapter = :async

  # config.action_mailer.delivery_method = :smtp
  # config.action_mailer.smtp_settings = {
  #  :address => Rails.application.credentials.dig(:ses, :address),
  #  :user_name => Rails.application.credentials.dig(:ses, :user_name), # Your SMTP user here.
  #  :password => Rails.application.credentials.dig(:ses, :password), # Your SMTP password here.
  #  :authentication => :login,
  #  :enable_starttls_auto => true
  # }


  config.after_initialize do
    require "i18n-js/listen"
    I18nJS.listen(
      config_file: Rails.root.join("config/i18n.yml"),
      locales_dir: Rails.root.join("config/locales")
    )
  end

  if Chaskiq::Config.get('RAILS_LOG_TO_STDOUT').present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end
end
