require_relative Rails.root.join("lib/app_packages_catalog.rb")

## PLugin remote service

# upload to service, note that plugins on disk is needed.
# PluginSubscriptions::Plugin.upload_list()

## downloads to the plugin local database.
# PluginSubscriptions::PluginDownloader.new.fetch_plugin_data

module PluginSubscriptions
  class PluginDownloader
    API_ENDPOINT = Chaskiq::Config.fetch(
      "CHASKIQ_APPSTORE_URL",
      "https://appstore.chaskiq.io/api/plugins-list"
    )

    # Use the PluginDownloader class to fetch and download plugins:
    # main.rb
    # require_relative 'plugin_downloader'

    # Fetch and download plugins
    # api_endpoint = 'http://localhost:8080/api/plugin-list'
    # plugin_downloader = PluginDownloader.new(api_endpoint)
    # plugin_data = plugin_downloader.fetch_plugin_data
    # plugin_downloader.download_plugins(plugin_data)

    def initialize
      token = Chaskiq::Config.get("CHASKIQ_APPSTORE_TOKEN")
      raise "🔴 Token not present, please add CHASKIQ_APPSTORE_TOKEN to your env" if token.blank?

      @connection = Faraday.new(url: API_ENDPOINT, params: { token: token }) do |conn|
        conn.headers["Content-Type"] = "application/json"
        conn.adapter Faraday.default_adapter
      end
    end

    def fetch_plugin_data
      response = @connection.get
      if response.status == 200
        download_plugins(JSON.parse(response.body))
      else
        raise "🔥 Error fetching plugin data: #{response.status} #{response.body}"
      end
    end

    def download_plugins(plugin_data)
      plugin_data["data"].each do |o|
        app_package = AppPackage.find_or_initialize_by(name: o["name"])
        if app_package.frozen?
          Rails.logger.info("🟡 #{app_package.name} was not downloaded because it's frozen")
          next
        end
        settings = o["settings"].delete_if { |s| s["frozen"] }
        app_package.assign_attributes(
          name: o["name"].camelcase,
          settings: settings,
          capability_list: o["capabilities"],
          tag_list: o["tag_list"],
          plugin_attributes: { data: o["data"] }
        )
        if app_package.save
          Rails.logger.info("✅ #{app_package.name} saved ")
        else
          Rails.logger.error("🔴 Failed download to db on plugin #{o['name']}")
        end
      end
    end
  end

  class SupabaseRecord < ApplicationRecord
    self.abstract_class = true
    establish_connection(Chaskiq::Config.get("APPSTORE_DB_URL"))
  end

  class RemotePlugin < SupabaseRecord
    APPSTORE_DB_URL = "sqlite3::memory:".freeze

    establish_connection(Chaskiq::Config.fetch("APPSTORE_DB_URL", APPSTORE_DB_URL))

    # establish_connection :supabase
    self.table_name = "plugins"

    # backup plugins
    def self.store_plugin_files(package)
      plugin_name = package.name
      plugin = find_or_initialize_by(name: plugin_name)
      plugin_folder_path = Rails.root.join("app", "services", "message_apis", plugin_name.underscore)

      if Dir.exist?(plugin_folder_path)
        # Iterate over all files in the folder
        plugin_data = Dir.glob("#{plugin_folder_path}/**/*").map do |file_path|
          next if File.directory?(file_path)

          # Extract the content of the file
          file_content = File.read(file_path)

          # Create or update the plugin in the database
          plugin_file_name = File.basename(file_path) # , ".rb")

          {
            file: plugin_file_name,
            content: file_content
          }
        end

        plugin.update!(
          data: plugin_data,
          name: package.name,
          settings: package.settings,
          capabilities: package.capability_list,
          tag_list: package.tag_list,
          description: package.description
        )

        Rails.logger.info("✅ Processed #{plugin.name}")

      else
        Rails.logger.debug { "🟡 Folder not found: #{plugin_folder_path}" }
      end
    end

    def self.upload_list
      raise "💥💥💥 No Supabase config detected!! 💥💥💥, please contact Chaskiq authors if you want to publish a plugin." if Chaskiq::Config.get("APPSTORE_DB_URL").blank?

      AppPackage.all.each do |app_package|
        store_plugin_files(app_package)
      end
    end
  end
end
