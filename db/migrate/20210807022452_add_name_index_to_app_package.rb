class AddNameIndexToAppPackage < ActiveRecord::Migration[6.1]
  def change
    add_index :app_packages, :name, :unique => true
  end
end
