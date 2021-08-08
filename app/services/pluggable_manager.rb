require "open-uri"

class PluggableManager
  INSTALL_PATH = Rails.root.join("app/services/message_apis")

  attr_accessor :plugin, :reinstall_phase

  def install
    raise "plugin already exists" if AppPackage.find_by(name: @plugin.capitalize).present? && !@reinstall_phase

    # download
    download
    attach
    manifest_install
  end

  def reinstall
    @reinstall_phase = true
    install
    @reinstall_phase = false
  end

  def present_in_db?
    app_package.present?
  end

  def dir_installed?
    File.exist? plugin_path
  end

  def installed?
    present_in_db? && dir_installed?
  end

  def uninstall
    detach
    app_package&.destroy
  end

  def attach
    FileUtils.cp_r(
      Rails.root.join("spec", "fixtures", "plugins", @plugin),
      Rails.root.join(INSTALL_PATH)
    )
  end

  private

  def app_package
    AppPackage.find_by(name: @plugin.capitalize)
  end

  def manifest_install
    data = JSON.parse(
      File.open(plugin_path.join("manifest.json")).readlines.join
    )
    pkg = AppPackage.find_or_create_by(name: data["name"])
    pkg.update(data) if pkg.present?
  end

  def plugin_path
    Rails.root.join(INSTALL_PATH, @plugin)
  end

  def download
    Rails.root.join("spec", "plugins", @plugin)
  end

  def detach
    FileUtils.rm_rf(plugin_path)
  end
end
