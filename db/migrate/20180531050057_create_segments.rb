# frozen_string_literal: true

class CreateSegments < ActiveRecord::Migration[5.2]
  def change
    create_table :segments do |t|
      t.string :key, index: true
      t.references :app
      t.string :name
      t.jsonb :properties, default: '{}'

      t.timestamps
    end
  end
end
