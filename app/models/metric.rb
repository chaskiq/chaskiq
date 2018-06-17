class Metric < ApplicationRecord

  belongs_to :campaign
  belongs_to :trackable, polymorphic: true, required: true
  belongs_to :app_user, foreign_key: :trackable_id

  #system output
  scope :deliveries, ->{where(action: "deliver")}

  #user feedback
  scope :bounces, ->{ where(action: "bounce")}
  scope :opens,   ->{ where(action: "open") }
  scope :clicks,  ->{ where(action: "click")}
  scope :spams,   ->{ where(action: "spam") }

  #reportery
  scope :uniques, ->{group("host")}
end
