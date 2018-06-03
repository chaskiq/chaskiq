class CreateAppUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :app_users do |t|
      t.references :user, foreign_key: true
      t.references :app, foreign_key: true
      t.jsonb :properties, default: {} #null: false, default: '{}'
      t.datetime :last_visited_at
      t.string :referrer
      t.string :state
      t.timestamps
    end
  end
end
