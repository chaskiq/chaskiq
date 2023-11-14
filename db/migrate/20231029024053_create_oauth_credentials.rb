class CreateOauthCredentials < ActiveRecord::Migration[7.1]
  def change
    create_table :oauth_credentials do |t|
      t.string :uid
      t.string :token
      t.string :provider
      t.references :agent, null: false, foreign_key: true
      t.jsonb :data

      t.timestamps
    end
    add_index :oauth_credentials, :uid
  end
end
