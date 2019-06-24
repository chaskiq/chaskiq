class CreateVisits < ActiveRecord::Migration[6.0]
  def change
    create_table :visits do |t|
      t.string :url
      t.references :app_user, index: true, null: false
      t.timestamps
    end
  end
end
