# frozen_string_literal: true

class AddDateFieldsToAppUser < ActiveRecord::Migration[6.0]
  def change
    add_column :app_users, :last_seen, :datetime
    add_column :app_users, :first_seen, :datetime
    add_column :app_users, :signed_up, :datetime
    add_column :app_users, :last_contacted, :datetime
    add_column :app_users, :last_heard_from, :datetime
  end
end
