class Role < ApplicationRecord
  #belongs_to :app
  #belongs_to :agent, class_name: "Agent", primary_key: :user_id

  belongs_to :agent #, class_name: "Agent", foreign_key: "user_id"
  belongs_to :app

  scope :admin , ->{where("role =?", "admin")}
end
