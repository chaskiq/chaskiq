class ExternalProfile < ApplicationRecord
  belongs_to :app_user
  has_one :app, through: :app_user

  after_commit :reindex_product

  def reindex_product
    app_user&.reindex
  end

  def app_package
    app.app_package_integrations
       .joins(:app_package)
       .find_by("app_packages.name": provider.capitalize)
       .first
  end

  def sync
    app_package.message_api_klass.register_contact(app_user)
  end
end
