class CreateAppUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :app_users do |t|
      t.references :user, foreign_key: true
      t.references :app, foreign_key: true
      t.jsonb :properties, null: false, default: '{}'

      t.string :state
      t.timestamps
    end
  end
end
