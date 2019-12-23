# frozen_string_literal: true

class CreateAssignmentRules < ActiveRecord::Migration[6.0]
  def change
    create_table :assignment_rules do |t|
      t.references :app, null: false, foreign_key: true, index: true
      t.references :agent, null: false, index: true
      t.jsonb :conditions
      t.integer :priority
      t.string :state
      t.string :title

      t.timestamps
    end
  end
end
