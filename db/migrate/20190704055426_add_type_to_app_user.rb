# frozen_string_literal: true

class AddTypeToAppUser < ActiveRecord::Migration[6.0]
  def change
    add_column :app_users, :type, :string
    add_index :app_users, :type
  end
end
