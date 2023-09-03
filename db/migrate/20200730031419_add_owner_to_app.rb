class AddOwnerToApp < ActiveRecord::Migration[6.0]
  def change
    add_column :apps, :owner_id, :integer
  end
end
