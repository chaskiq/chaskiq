# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :events do |t|
      t.references :eventable, polymorphic: true, index: true, null: false
      t.string :action
      t.jsonb :properties

      t.timestamps
    end
    add_index :events, :action
  end
end
