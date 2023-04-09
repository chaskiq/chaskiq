class CreatePlugins < ActiveRecord::Migration[7.0]
  def change
    create_table :plugins do |t|
      t.jsonb :data
      t.references :app_package  
      t.timestamps
    end
  end
end
