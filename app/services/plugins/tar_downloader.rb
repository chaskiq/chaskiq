require "faraday"
require "rubygems/package"
require "zlib"

# downloader = PluginDownloader.new(api_url, owner, repo, tag)
#
# if downloader.download_plugin
#   downloader.extract_plugin
#   # downloader.iterate_extracted_folders
#   downloader.copy_folders_to_destination
# else
#   puts "Failed to download plugin"
# end
#

class Plugins::TarDownloader
  def initialize(
    api_url: "https://appstore.chaskiq.io",
    tag: "2.0.0-rc"
  )
    @api_url = api_url
    @tag = tag
  end

  def download_plugin
    conn = Faraday.new(url: @api_url) do |faraday|
      # faraday.use FaradayMiddleware::FollowRedirects
      faraday.adapter Faraday.default_adapter
    end

    response = conn.get("/api/v1/download-plugins?tag=#{@tag}&token=#{Chaskiq::Config.get('CHASKIQ_APPSTORE_TOKEN')}")

    if response.status == 200
      tarball_path = Rails.root.join("tmp/#{@repo}-#{@tag}.tar.gz")
      File.binwrite(tarball_path, response.body)
      Rails.logger.info "✅ Downloaded #{tarball_path}"
      true
    else
      Rails.logger.info "🔴 Failed to download plugin: #{response.status} #{response.reason_phrase}"
      false
    end
  end

  def namespace
    "#{@repo}-#{@tag}"
  end

  def extract_plugin
    tarball_path = Rails.root.join("tmp/#{namespace}.tar.gz")
    extracted_path = Rails.root.join("tmp/extracted-#{namespace}")

    File.open(tarball_path, "rb") do |file|
      Zlib::GzipReader.wrap(file) do |gz|
        Gem::Package::TarReader.new(gz) do |tar|
          tar.each do |entry|
            dest_path = File.join(extracted_path, entry.full_name)
            if entry.directory?
              FileUtils.mkdir_p(dest_path)
            else
              FileUtils.mkdir_p(File.dirname(dest_path))
              File.binwrite(dest_path, entry.read)
            end
          end
        end
      end
    end
    Rails.logger.info "🌱🌱🌱 Extracted #{tarball_path} to #{extracted_path} 🌱🌱🌱"
  end

  def copy_folders_to_destination
    extracted_path = Rails.root.join("tmp/extracted-#{namespace}")
    destination_path = Rails.root.join("app/services/message_apis")

    Dir.glob("#{extracted_path}/*/*/").each do |folder|
      folder_name = File.basename(folder)
      destination_folder = File.join(destination_path, folder_name)

      package_name = folder_name.camelcase

      app_package = AppPackage.find_or_initialize_by(name: package_name)
      if app_package.frozen?
        Rails.logger.info("🟡 #{app_package.name} was not downloaded because it's frozen")
        next
      end

      FileUtils.rm_rf(destination_folder)
      FileUtils.cp_r(folder, destination_folder)

      Rails.autoloaders.main.push_dir(destination_folder)
      Rails.autoloaders.main.require_dependency("#{destination_folder}/api.rb")

      definition_info = "MessageApis::#{package_name}::Api".constantize.definition_info

      Plugin.load_plugin_and_create_packages_from_fs(folder_name, @tag)

      # puts "Copied folder: #{folder} to #{destination_folder}"
    end
  end

  def list_releases
    conn = Faraday.new(url: @api_url) do |faraday|
      # faraday.use FaradayMiddleware::FollowRedirects
      faraday.adapter Faraday.default_adapter
    end
    conn.get("/api/v1/list-releases?token=#{Chaskiq::Config.get('CHASKIQ_APPSTORE_TOKEN')}")
  end
end
