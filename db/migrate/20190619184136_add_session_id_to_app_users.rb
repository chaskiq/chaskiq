class AddSessionIdToAppUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :app_users, :session_id, :string
  end
end
