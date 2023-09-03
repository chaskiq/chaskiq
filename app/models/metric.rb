# frozen_string_literal: true

class Metric < ApplicationRecord
  # belongs_to :campaign, class_name: "Message", foreign_key: "campaign_id"
  belongs_to :trackable, polymorphic: true, optional: false
  # belongs_to :app_user , foreign_key: :trackable_id
  belongs_to :app_user

  scope :action, ->(action) { where(action: action) }
  # system output
  scope :deliveries, -> { action("delivery") }
  # user feedback
  scope :bounces, -> { action("bounce") }
  scope :opens,   -> { action("open") }
  scope :clicks,  -> { action("click") }
  scope :complaints, -> { action("complaint") }
  scope :rejects, -> { action("reject") }
  scope :spams,   -> { complaints }
  # reportery
  scope :uniques, -> { group("host") }

  def self.action_counts
    group([:action]).count
  end
end
