require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Chaskiq
  module Config

    def self.get(name)
      # config[name] || ENV[name.upcase]
      Rails.application.credentials.config.fetch(
        name.downcase.to_sym, ENV[name.to_s.upcase]
      )
    end
  
    def self.fetch(name, fallback)
      Rails.application.credentials.config.fetch(
        name.downcase.to_sym, ENV.fetch(name.to_s.upcase, fallback)
      )
      # config[name] || ENV.fetch(name.upcase, fallback)
    end
  end

  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
