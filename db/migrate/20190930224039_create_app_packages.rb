# frozen_string_literal: true

class CreateAppPackages < ActiveRecord::Migration[6.0]
  def change
    create_table :app_packages do |t|
      t.string :name
      t.text :description
      t.jsonb :settings
      t.string :state
      t.string :url

      t.timestamps
    end
  end
end
