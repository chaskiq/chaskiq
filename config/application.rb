require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

Dotenv::Railtie.load if defined?(Dotenv::Railtie)

module Chaskiq
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    # config.load_defaults 5.2
    config.load_defaults "6.0"

    config.action_cable.disable_request_forgery_protection = true


    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    config.generators do |g|
      g.test_framework :rspec, :fixture => false
      #g.orm :active_record, primary_key_type: :uuid
      #g.fixture_replacement :factory_girl, :dir => 'spec/factories'
      g.assets false
      g.helper false
    end

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [:get, :post, :put, :options]
      end
    end

    locales = %w(af sq ar eu bg be ca hr cs da nl en eo et fo fi fr gl de el iw hu is ga it ja ko lv lt mk mt no pl pt ro ru gd sr sr sk sl es sv tr uk)
    config.available_locales = locales
    I18n.available_locales = locales
    config.i18n.default_locale = :en
    
  end
end
