# frozen_string_literal: true

class CreateAppUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :app_users do |t|
      t.string :key, index: true
      t.references :app, foreign_key: true
      t.jsonb :properties, default: {} # null: false, default: '{}'
      t.datetime :last_visited_at
      t.string   :referrer
      t.string   :state
      t.string   :ip
      t.string   :city
      t.string   :region
      t.string   :country
      t.string   :subscription_state

      t.string :session_id

      t.string :email
      # t.string   :lat
      # t.column 'lat', 'point'
      # t.column 'lng', 'point'
      # t.string   :lng
      t.decimal :lat, precision: 15, scale: 10
      t.decimal :lng, precision: 15, scale: 10
      t.string   :postal
      t.integer  :web_sessions
      t.string   :timezone
      t.string   :browser
      t.string   :browser_version
      t.string   :os
      t.string   :os_version
      t.string   :browser_language
      t.string   :lang
      t.timestamps
    end
  end
end
