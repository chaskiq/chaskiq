class CreateBotPaths < ActiveRecord::Migration[6.0]
  def change
    create_table :bot_paths do |t|
      t.string :title
      t.string :key
      t.jsonb :steps
      t.jsonb :settings
      t.references :bot_task, null: false, foreign_key: true
      t.jsonb :predicates

      t.timestamps
    end
    add_index :bot_paths, :key
  end
end
