class ChaskiqPluginGenerator < Rails::Generators::NamedBase
  source_root File.expand_path("templates", __dir__)

  def start
    template "api.rb.template", "app/services/message_apis/#{file_name}/api.rb"
    template "presenter.rb.template", "app/services/message_apis/#{file_name}/presenter.rb" if yes?("Would you like to add a presenter?")
  end
end
