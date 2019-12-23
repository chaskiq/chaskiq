# frozen_string_literal: true

class AddUserToMetric < ActiveRecord::Migration[6.0]
  def change
    add_reference :metrics, :app_user, null: false, foreign_key: true
  end
end
