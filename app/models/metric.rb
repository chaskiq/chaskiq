# frozen_string_literal: true

class Metric < ApplicationRecord
  # belongs_to :campaign, class_name: "Message", foreign_key: "campaign_id"
  belongs_to :trackable, polymorphic: true, required: true
  # belongs_to :app_user , foreign_key: :trackable_id
  belongs_to :app_user

  # system output
  scope :deliveries, -> { where(action: 'delivery') }

  # user feedback
  scope :bounces, -> { where(action: 'bounce') }
  scope :opens,   -> { where(action: 'open') }
  scope :clicks,  -> { where(action: 'click') }
  scope :complaints, -> { where(action: 'complaint') }
  scope :rejects, -> { where(action: 'reject') }
  scope :spams,   -> { where(action: 'complaint') }

  # reportery
  scope :uniques, -> { group('host') }

  def self.action_counts
    group([:action]).count
  end
end
