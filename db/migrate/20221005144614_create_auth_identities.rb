class CreateAuthIdentities < ActiveRecord::Migration[7.0]
  def change
    create_table :auth_identities do |t|
      t.references :agent, null: false, foreign_key: true
      t.string :provider
      t.string :uid

      t.timestamps
    end
    add_index :auth_identities, :provider
    add_index :auth_identities, :uid
  end
end
