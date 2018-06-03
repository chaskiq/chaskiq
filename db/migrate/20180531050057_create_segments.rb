class CreateSegments < ActiveRecord::Migration[5.2]
  def change
    create_table :segments do |t|
      t.references :app
      t.jsonb :properties, default: '{}'

      t.timestamps
    end
  end
end
