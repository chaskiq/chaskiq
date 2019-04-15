class AddEncryptionKeyToApp < ActiveRecord::Migration[6.0]
  def change
    add_column :apps, :encryption_key, :string, limit: 16
  end
end
