class AddIndexToAppUserSessionId < ActiveRecord::Migration[6.0]
  def change
    add_index :app_users, :session_id
  end
end
