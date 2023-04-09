require_relative Rails.root.join("lib/app_packages_catalog.rb")


## PLugin remote service

# upload to service, note that plugins on disk is needed.
# PluginSubscriptions::Plugin.upload_list()

## downloads to the plugin local database.
# PluginSubscriptions::PluginDownloader.new.fetch_plugin_data

module PluginSubscriptions
  class PluginDownloader
    API_ENDPOINT = "http://localhost:8080/api/plugins-list".freeze

    # Use the PluginDownloader class to fetch and download plugins:
    # main.rb
    # require_relative 'plugin_downloader'

    # Fetch and download plugins
    # api_endpoint = 'http://localhost:8080/api/plugin-list'
    # plugin_downloader = PluginDownloader.new(api_endpoint)
    # plugin_data = plugin_downloader.fetch_plugin_data
    # plugin_downloader.download_plugins(plugin_data)
    # This implementation fetches the plugin data from the given API endpoint, and then downloads the plugins by creating the necessary directories and files. Make sure the API endpoint is accessible and returns the expected JSON format.

    def initialize
      @connection = Faraday.new(url: API_ENDPOINT) do |conn|
        conn.headers["Content-Type"] = "application/json"
        conn.adapter Faraday.default_adapter
      end
    end

    def fetch_plugin_data
      response = @connection.get
      if response.status == 200
        download_plugins(JSON.parse(response.body))
      else
        raise "Error fetching plugin data: #{response.status} #{response.body}"
      end
    end

    def download_plugins(plugin_data)
      plugin_data["data"].each do |o|
        plugin = Plugin.find_or_initialize_by(name: o["name"])
        plugin.assign_attributes(data: o["data"], name: o["name"])
        plugin.save
      end
    end
  end

  class RemotePlugin < ApplicationRecord
    establish_connection :supabase
    self.table_name = "plugins"

    # backup plugins
    def self.store_plugin_files(plugin_name)
      plugin = find_or_initialize_by(name: plugin_name)
      plugin_folder_path = Rails.root.join("app", "services", "message_apis", plugin_name)

      if Dir.exist?(plugin_folder_path)
        # Iterate over all files in the folder
        plugin_data = Dir.glob("#{plugin_folder_path}/**/*").map do |file_path|
          next if File.directory?(file_path)

          # Extract the content of the file
          file_content = File.read(file_path)

          # Create or update the plugin in the database
          plugin_file_name = File.basename(file_path, ".rb")

          {
            file: plugin_file_name,
            content: file_content
          }
        end

        package = AppPackage.find_by(name: plugin_name.camelcase)

        raise "no app package found by #{plugin_name.camelcase}" if package.blank?

        plugin.update!(
          data: plugin_data,
          name: plugin_name,
          definitions: package.settings[:defintions],
          capabilities: package.capability_list
        )

        Rails.logger.info("processed #{plugin.name}")

      else
        Rails.logger.debug { "Folder not found: #{plugin_folder_path}" }
      end
    end

    def self.upload_list
      list = AppPackagesCatalog.packages(dev_packages: false).map { |o| o[:name].underscore }

      list.each do |plugin|
        store_plugin_files(plugin)
      end
    end
  end
end
