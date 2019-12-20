class AppPackage < ApplicationRecord
  has_many :app_package_integrations
  has_many :apps, through: :app_package_integrations

  acts_as_taggable 

  store :settings, accessors: [ 
    :definitions,
    :icon,
  ], coder: JSON

end
