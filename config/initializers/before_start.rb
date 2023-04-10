

if defined?(Rails::Server) || defined?(Rails::Console)
  Rails.application.config.to_prepare do
    # This will force Rails to load all models
    Rails.application.eager_load!

    def plugin_autoloader
      puts "PREPARE TO SAVE CHASKIQ PLUGINS"
      Plugin.save_all_plugins unless Chaskiq::Config.get("DISABLE_AUTOLOAD_APPSTORE")
    end

    plugin_autoloader
  end
end