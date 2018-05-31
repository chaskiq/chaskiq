class CreateSegments < ActiveRecord::Migration[5.2]
  def change
    create_table :segments do |t|
      t.references :app
      t.jsonb :properties, null: false, default: '{}'

      t.timestamps
    end
  end
end
