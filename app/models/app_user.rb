class AppUser < ApplicationRecord
  belongs_to :user
  belongs_to :app
  store :properties, accessors: [ :name, :first_name, :last_name ], coder: JSON
end
