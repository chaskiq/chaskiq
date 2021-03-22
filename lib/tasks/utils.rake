require 'app_packages_catalog'

namespace :packages do
  task update: :environment do
    AppPackagesCatalog.update_all
  end

  task attach: :environment do
    App.find_each { |a| a.attach_default_packages }
  end
end

namespace :owner_apps do
  task make_owner: :environment do
    # roles owners
    App.all.each  do |o|
      o.owner = Agent.find_by(email: ENV['ADMIN_EMAIL'])
      o.save
    end
  end
end
