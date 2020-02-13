class ExternalProfile < ApplicationRecord
  belongs_to :app_user
  has_one :app, through: :app_user

  def app_package
    app.app_package_integrations
    .joins(:app_package)
    .where("app_packages.name": provider.capitalize)
    .first
  end

  def sync
    app_package.message_api_klass.register_contact(app_user)
  end
  
end
