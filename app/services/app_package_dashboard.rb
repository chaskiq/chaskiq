# frozen_string_literal: true

class AppPackageDashboard
  attr_accessor :app, :range

  # d = Dashboard.new(app: App.find(n) )
  def initialize(app:, range:, package: nil)
    @app = app
    @package_name = package
    @range = (DateTime.parse(range[:from])..DateTime.parse(range[:to]))
    @page = range[:page]
  end

  def resource
    app
  end

  def report_for(path)
    integration = self.class.app_package(@app, @package_name)
    integration.report(path, { range: @range, page: @page })
  end

  def self.app_packages_list(app)
    dashboard_tags = app.app_packages.tagged_with("dashboard").pluck(:id)
    integrations = app.app_package_integrations.includes(:app_package).where(app_package: dashboard_tags)
    integrations.map do |integration|
      {
        name: integration.app_package.name,
        icon: integration.app_package.icon,
        paths: integration.message_api_klass.try(:report_kinds) || []
      }
    end
  end

  def self.app_package(app, package)
    dashboard_tags = app.app_packages.tagged_with("dashboard").find_by(name: package)
    integration = app.app_package_integrations.includes(:app_package)
                     .find_by(app_package: dashboard_tags)
  end

  def app_packages
    result = []

    dashboard_tags = @app.app_packages.tagged_with("dashboard").pluck(:id)

    integrations = @app.app_package_integrations.includes(:app_package).where(app_package: dashboard_tags)

    integrations.map do |integration|
      result << app_package_stats(integration)
    end

    result
  end

  private

  def app_package_stats(integration)
    Rails.cache.fetch(
      "#{integration.cache_key_with_version}/dashboard-packages",
      expires_in: 1.hour
    ) do
      {
        name: integration.app_package.name,
        icon: integration.app_package.icon,
        data: integration.message_api_klass.get_stats
      }
    end
  end

  def colors
    array = %w[265 20 30 110 120 160 260 270 290 330 400]
    array.sample
  end
end
