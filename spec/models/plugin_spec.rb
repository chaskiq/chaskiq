require "rails_helper"

RSpec.describe Plugin, type: :model do
  describe ".save_plugin_files_to_folder" do
    it "loads the plugin class after saving the file" do
      # Create a plugin instance with sample data
      # allow_any_instance_of(AppPackage).to receive(:is_external?).and_return(false)

      plugin_name = "test_plugin"
      plugin_data = [{
        "file" => "api.rb",
        "content" => <<-RUBY
          module MessageApis::#{plugin_name.camelize}
            class Api < MessageApis::BasePackage
              def self.test_method
                "Hello from #{plugin_name}"
              end

              def self.definition_info
                {
                  name: "TestPlugin",
                  definitions: []
                }
              end
            end
          end
        RUBY
      }]

      app_package = AppPackage.create(name: "TestPlugin", definitions: [], plugin_attributes: { data: plugin_data })

      plugin = app_package.plugin

      # plugin = Plugin.create!(data: plugin_data, app_package: app_package)

      # Save the plugin file and load the class
      Plugin.save_plugin_files_to_folder(plugin.app_package.name)

      # Check if the class exists and is loaded
      plugin_class = "MessageApis::#{plugin_name.camelize}::Api".constantize
      expect(plugin_class).to be_present
      expect(plugin_class.test_method).to eq("Hello from #{plugin_name}")

      # Clean up the generated plugin folder
      FileUtils.rm_rf(Rails.root.join("app", "services", "message_apis", plugin_name))
    end
  end
end
