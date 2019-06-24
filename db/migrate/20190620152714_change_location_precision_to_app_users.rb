class ChangeLocationPrecisionToAppUsers < ActiveRecord::Migration[6.0]
  def change
    change_column :app_users, :lat, :decimal, :precision => 15, :scale => 10
    change_column :app_users, :lng, :decimal, :precision => 15, :scale => 10
  end
end
