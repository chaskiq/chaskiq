require 'app_packages_catalog'

namespace :packages do
  task update: :environment do
    AppPackagesCatalog.update_all 
  end
end

namespace :owner_apps do
  task make_owner: :environment do
    # roles owners
    App.all.each{|o| 
      o.owner = Agent.find_by(email: ENV["ADMIN_EMAIL"])
      o.save  
    }
  end
end
