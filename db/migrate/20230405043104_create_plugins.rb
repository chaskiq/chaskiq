class CreatePlugins < ActiveRecord::Migration[7.0]
  def change
    create_table :plugins do |t|
      t.string :name
      t.string :slug
      t.string :state
      t.jsonb :data
      t.jsonb :definitions

      t.timestamps
    end
  end
end
