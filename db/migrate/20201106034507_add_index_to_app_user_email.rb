class AddIndexToAppUserEmail < ActiveRecord::Migration[6.0]
  def change
    add_index :app_users, :email
  end
end
