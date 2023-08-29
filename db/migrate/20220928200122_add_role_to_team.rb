class AddRoleToTeam < ActiveRecord::Migration[7.0]
  def change
    add_column :teams, :role, :string
    add_index :teams, :role
  end
end
