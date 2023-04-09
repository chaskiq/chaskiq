class Plugin < ApplicationRecord
  # plugin = Plugin.find_by(name: 'your_plugin_name')
  # Plugin.save_plugin_files_to_folder(plugin) if plugin


  def self.save_all_plugins
    Plugin.all.each {|o| Plugin.save_plugin_files_to_folder(o.name )}
  end

  def self.save_plugin_files_to_folder(plugin_name)
    plugin = Plugin.find_by(name: plugin_name)

    plugin_name = plugin.name
    plugin_data = plugin.data

    if plugin_data.present? && plugin_data.is_a?(Array)
      plugin_folder_path = Rails.root.join("app", "services", "message_apis", plugin_name)

      # Create the plugin folder if it doesn't exist
      FileUtils.mkdir_p(plugin_folder_path)

      plugin_data.each do |d|
        # Save the plugin file to the folder
        file_path = plugin_folder_path.join("#{d['file']}.rb")
        File.open(file_path, "w") do |file|
          file.write(d["content"])
          # Load the plugin file using Zeitwerk
          Rails.logger.info "Plugin file '#{d['file']}' saved to folder '#{plugin_folder_path}'."
        end

        Rails.autoloaders.main.push_dir(plugin_folder_path)
        Rails.autoloaders.main.require_dependency(file_path.to_s)
        Rails.logger.info("autoloaded #{plugin_folder_path}")
        Rails.logger.info("autoloaded #{file_path}")
      end
    else
      Rails.logger.debug "Invalid plugin data format. Expected 'file' and 'content' keys."
    end
  end
end
