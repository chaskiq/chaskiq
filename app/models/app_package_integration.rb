class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app
end
