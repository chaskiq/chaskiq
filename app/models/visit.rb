# frozen_string_literal: true

class Visit < ApplicationRecord
  belongs_to :app_user
  has_one :app, through: :app_user

  after_create :insert_count

  def insert_count
    AppIdentity.new(app.key).visits.incr(1, self.created_at)
  end
end
