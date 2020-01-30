# frozen_string_literal: true

class Visit < ApplicationRecord
  belongs_to :app_user
  has_one :app, through: :app_user

  after_create :insert_count

  def self.register(options, cond)
    v = self.new(options) 
    return v.save if cond == "true"
    v.insert_count
  end

  def insert_count
    AppIdentity.new(app.key).visits.incr(1, Time.zone.now)
  end
end
