class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app

  store :settings, accessors: [ 
    :api_key, 
    :api_secret,
    :project_id
  ], coder: JSON

  validate do
    self.app_package.definitions.each do |definition|
      key = definition[:name].to_sym
      next unless self.class.stored_attributes[:settings].include?(key)
      errors.add(key, "#{key} is required") if self.send(key).blank?
    end
  end

end


