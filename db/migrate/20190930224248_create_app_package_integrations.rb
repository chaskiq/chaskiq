# frozen_string_literal: true

class CreateAppPackageIntegrations < ActiveRecord::Migration[6.0]
  def change
    create_table :app_package_integrations do |t|
      t.references :app_package, null: false, foreign_key: true
      t.references :app, null: false, foreign_key: true
      t.jsonb :settings
      t.string :state

      t.timestamps
    end
  end
end
