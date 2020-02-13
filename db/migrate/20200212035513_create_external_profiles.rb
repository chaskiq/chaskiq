class CreateExternalProfiles < ActiveRecord::Migration[6.0]
  def change
    create_table :external_profiles do |t|
      t.string :provider
      t.references :app_user, null: false, foreign_key: true
      t.jsonb :data
      t.string :profile_id

      t.timestamps
    end
    add_index :external_profiles, :provider
    add_index :external_profiles, :profile_id
  end
end
