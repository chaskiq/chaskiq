# frozen_string_literal: true

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in either ENV["RAILS_MASTER_KEY"]
  # or in config/master.key. This key is used to decrypt credentials (and other encrypted files).
  config.require_master_key = false

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = Chaskiq::Config.get('RAILS_SERVE_STATIC_FILES')

  # Compress CSS using a preprocessor.
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false
  config.assets.enabled = false if ENV['ANYCABLE_DEPLOYMENT']

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.action_controller.asset_host = 'http://assets.example.com'
  config.action_controller.asset_host = Chaskiq::Config.fetch('ASSET_HOST', Chaskiq::Config.get("HOST") )


  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = 'X-Sendfile' # for Apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX

  # Store uploaded files on the local file system (see config/storage.yml for options).
  # config.active_storage.service = :local

  config.active_storage.service = :amazon

  Rails.application.routes.default_url_options = { host: Chaskiq::Config.get('HOST') }
  config.action_controller.default_url_options = { host: Chaskiq::Config.get('HOST') }
  config.action_mailer.default_url_options = { host: Chaskiq::Config.get('HOST') }

  # Mount Action Cable outside main process or domain.
  # config.action_cable.mount_path = nil
  config.action_cable.url = Chaskiq::Config.get('WS') # Rails.application.credentials.ws
  # config.action_cable.allowed_request_origins = [ 'http://example.com', /http:\/\/example.*/ ]

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = false

  # Use the lowest log level to ensure availability of diagnostic information
  # when problems arise.
  config.log_level = :warn

  # Prepend all log lines with the following tags.
  config.log_tags = [:request_id]

  config.cache_store = :redis_cache_store, { url: Chaskiq::Config.get('REDIS_URL') }

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Use a real queuing backend for Active Job (and separate queues per environment).
  # config.active_job.queue_adapter     = :resque
  # config.active_job.queue_name_prefix = "hermes_production"

  config.active_job.queue_adapter = :sidekiq
  # config.active_job.queue_name_prefix = "hermes_#{Rails.env}"

  config.action_mailer.perform_caching = false

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Use a different logger for distributed setups.
  # require 'syslog/logger'
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new 'app-name')

  if Chaskiq::Config.get('RAILS_LOG_TO_STDOUT').present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  # config.active_record.dump_schema_after_migration = false
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
    zone = Chaskiq::Config.get('AWS_S3_REGION')

    creds = Aws::Credentials.new(
      Chaskiq::Config.get('AWS_ACCESS_KEY_ID'),
      Chaskiq::Config.get('AWS_SECRET_ACCESS_KEY')
    )

    Aws::Rails.add_action_mailer_delivery_method(
      :ses,
      credentials: creds,
      region: zone
    )

    config.action_mailer.delivery_method = :ses
  end

  # Inserts middleware to perform automatic connection switching.
  # The `database_selector` hash is used to pass options to the DatabaseSelector
  # middleware. The `delay` is used to determine how long to wait after a write
  # to send a subsequent read to the primary.
  #
  # The `database_resolver` class is used by the middleware to determine which
  # database is appropriate to use based on the time delay.
  #
  # The `database_resolver_context` class is used by the middleware to set
  # timestamps for the last write to the primary. The resolver uses the context
  # class timestamps to determine how long to wait before reading from the
  # replica.
  #
  # By default Rails will store a last write timestamp in the session. The
  # DatabaseSelector middleware is designed as such you can define your own
  # strategy for connection switching and pass that into the middleware through
  # these configuration options.
  # config.active_record.database_selector = { delay: 2.seconds }
  # config.active_record.database_resolver = ActiveRecord::Middleware::DatabaseSelector::Resolver
  # config.active_record.database_resolver_context = ActiveRecord::Middleware::DatabaseSelector::Resolver::Session
end
