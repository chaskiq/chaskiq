class CreateWorkflows < ActiveRecord::Migration[6.1]
  def change
    return if ActiveRecord::Base.connection.table_exists? 'workflows'
    create_table :workflows do |t|
      t.string :title
      t.jsonb :settings
      t.jsonb :rules
      t.string :state
      t.references :app, null: false, foreign_key: true

      t.timestamps
    end
    add_index :workflows, :state
  end
end
