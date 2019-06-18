class AddEmailToAppUser < ActiveRecord::Migration[6.0]
  def change
    add_column :app_users, :email, :string
  end
end
