# frozen_string_literal: true

class CreateVisits < ActiveRecord::Migration[6.0]
  def change
    create_table :visits do |t|
      t.string :url
      t.references :app_user, index: true, null: false

      t.string :title
      t.string :browser_version
      t.string :browser_name
      t.string :os
      t.string :os_version

      t.timestamps
    end
  end
end
