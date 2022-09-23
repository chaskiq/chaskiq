class CreateTeams < ActiveRecord::Migration[7.0]
  def change
    create_table :teams do |t|
      t.references :app, null: false, foreign_key: true
      t.string :name
      t.string :slug
      t.string :state
      t.text :description

      t.timestamps
    end
  end
end
