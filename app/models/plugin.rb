class Plugin < ApplicationRecord
  # plugin = Plugin.find_by(name: 'your_plugin_name')
  # Plugin.save_plugin_files_to_folder(plugin) if plugin
  belongs_to :app_package

  def self.save_all_plugins
    Plugin.all.find_each do |o|
      Plugin.save_plugin_files_to_folder(o.app_package.name)
    end
  end

  def self.save_plugin_files_to_folder(plugin_name)
    app_package = AppPackage.find_by(name: plugin_name)
    plugin = app_package.plugin || app_package.build_plugin

    if app_package.frozen?
      Rails.logger.info("🟡 [#{app_package.name}] Skip installation because it's frozen")
      return nil
    end

    plugin_name = app_package.name
    plugin_data = plugin.data

    if plugin_data.present? && plugin_data.is_a?(Array)
      plugin_folder_path = Rails.root.join("app", "services", "message_apis", plugin_name.underscore)

      # Create the plugin folder if it doesn't exist
      FileUtils.mkdir_p(plugin_folder_path)

      plugin_data.each do |d|
        # Save the plugin file to the folder
        file_path = plugin_folder_path.join((d["file"]).to_s)
        File.open(file_path, "w") do |file|
          file.write(d["content"])
          Rails.logger.info "✅ [#{plugin_name}] Plugin file '#{d['file']}' saved to folder '#{plugin_folder_path}'."
        end

        # Load the plugin file using Zeitwerk
        Rails.autoloaders.main.push_dir(plugin_folder_path)
        Rails.autoloaders.main.require_dependency(file_path.to_s)
        # Rails.logger.info("⚓ autoloaded #{plugin_folder_path}")
        # Rails.logger.info("⚓ autoloaded #{file_path}")
      end
    else
      Rails.logger.error "🔴 Invalid plugin data format. Expected 'file' and 'content' keys."
    end
  end
end
