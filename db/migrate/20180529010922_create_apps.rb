# frozen_string_literal: true

class CreateApps < ActiveRecord::Migration[5.2]
  def change
    create_table :apps do |t|
      t.string :key, index: true
      t.string :name
      t.string :token
      t.string :state
      t.string :timezone
      t.string :test_key
      t.string :encryption_key, limit: 16
      t.jsonb :preferences, null: false, default: '{}'
      t.timestamps
    end

    add_index :apps, :preferences, using: :gin
  end
end
