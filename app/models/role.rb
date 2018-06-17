class Role < ApplicationRecord
  belongs_to :app
  belongs_to :user

  scope :admin , ->{where("role =?", "admin")}
end
