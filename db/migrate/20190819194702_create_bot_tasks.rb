# frozen_string_literal: true

class CreateBotTasks < ActiveRecord::Migration[6.0]
  def change
    create_table :bot_tasks do |t|
      t.string :title
      t.string :state
      t.jsonb :predicates
      t.references :app, null: false, foreign_key: true
      t.jsonb :settings
      t.json :paths

      t.timestamps
    end
    add_index :bot_tasks, :state
  end
end
