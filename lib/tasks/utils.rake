require 'app_packages_catalog'

namespace :packages do
  task update: :environment do
    AppPackagesCatalog.update_all 
  end
end
