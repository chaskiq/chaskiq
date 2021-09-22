class ChaskiqPluginGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('templates', __dir__)

  def start
    template "api.rb", "app/services/message_apis/#{file_name}/api.rb"
    if yes?("Would you like to add a presenter?")
      template "presenter.rb", "app/services/message_apis/#{file_name}/presenter.rb"
    end
  end
end
