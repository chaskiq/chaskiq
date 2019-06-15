class CreateJwtBlackList < ActiveRecord::Migration[6.0]
  def change


    add_column :users, :jti, :string #, null: false
    add_index :users, :jti, unique: true

    create_table :jwt_blacklist do |t|
      t.string :jti, null: false
      t.datetime :exp, null: false
    end
    add_index :jwt_blacklist, :jti

  end
end
