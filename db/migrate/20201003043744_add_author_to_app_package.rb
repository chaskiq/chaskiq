class AddAuthorToAppPackage < ActiveRecord::Migration[6.0]
  def change
    add_reference :app_packages, :agent, null: true, foreign_key: true
    add_column :app_packages, :published, :boolean, :default => false
    #Ex:- :default =>''
    #Ex:- add_column("admin_users", "username", :string, :limit =>25, :after => "email")
  end
end
