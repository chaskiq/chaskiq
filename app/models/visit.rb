# frozen_string_literal: true

class Visit < ApplicationRecord
  belongs_to :app_user
  has_one :app, through: :app_user
end
