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

  # will read the plugin files and store plugins locally on AppPackage / Plugin
  def self.restore_plugins_from_fs
    plugins_base_path = Rails.root.join("app/services/message_apis")

    # Iterate over all plugin folders
    Dir.glob("#{plugins_base_path}/*").each do |plugin_folder|
      next unless File.directory?(plugin_folder)

      load_plugin_and_create_packages_from_fs(plugin_folder)
    end

    Rails.logger.info "Process completed"
  end

  def self.load_plugin_and_create_packages_from_fs(plugin_folder, version = nil)
    plugin_name = File.basename(plugin_folder).camelize

    files_data = Dir.glob("#{plugin_folder}/**/*").map do |file_path|
      next if File.directory?(file_path)

      # Read the contents of the file
      file_content = File.read(file_path)
      file_name = File.basename(file_path)

      # Create a hash with the file name and content
      { file: file_name, content: file_content }
    end.compact

    # Initialize the AppPackage
    app_package = AppPackage.find_or_initialize_by(name: plugin_name)

    # Set the definitions and plugin attributes
    api_klass = "MessageApis::#{plugin_name}::Api".constantize
    app_package.assign_attributes(api_klass.definition_info)
    app_package.plugin_attributes = { data: files_data, version: version }

    # Save the AppPackage
    if app_package.save
      Rails.logger.info "✅ [#{plugin_name}] Saved from source"
    else
      Rails.logger.error "🔴 [#{plugin_name}] Error"
    end
  end
end
