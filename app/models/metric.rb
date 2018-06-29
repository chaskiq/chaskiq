class Metric < ApplicationRecord

  belongs_to :campaign
  belongs_to :trackable, polymorphic: true, required: true
  belongs_to :app_user, foreign_key: :trackable_id

  #system output
  scope :deliveries, ->{where(action: "delivery")}

  #user feedback
  scope :bounces, ->{ where(action: "bounce")}
  scope :opens,   ->{ where(action: "open") }
  scope :clicks,  ->{ where(action: "click")}
  scope :complaints,   ->{ where(action: "complaint") }
  scope :rejects,   ->{ where(action: "reject") }
  scope :spams,   ->{ where(action: "complaint") }

  #reportery
  scope :uniques, ->{group("host")}
end
