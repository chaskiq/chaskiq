class ChaskiqPluginGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('templates', __dir__)

  def start
    copy_file "api.rb", "app/services/message_apis/#{file_name}/api.rb"
    copy_file "presenter.rb", "app/services/message_apis/#{file_name}/presenter.rb"
  end

end
