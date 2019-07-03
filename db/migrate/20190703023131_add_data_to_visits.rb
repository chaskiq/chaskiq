class AddDataToVisits < ActiveRecord::Migration[6.0]
  def change
    add_column :visits, :title, :string
    add_column :visits, :browser_version, :string
    add_column :visits, :browser_name, :string
    add_column :visits, :os, :string
    add_column :visits, :os_version, :string
  end
end
