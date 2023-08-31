
require_relative "../chaskiq_boot.rb"

if defined?(Rails::Server) || defined?(Rails::Console) || Sidekiq.server?
  Rails.application.config.to_prepare do
    # This will force Rails to load all models
    Rails.application.eager_load!
    ChaskiqBoot.plugin_autoloader
  end
end