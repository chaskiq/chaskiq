class AddAvailableModeToAgents < ActiveRecord::Migration[6.0]
  def change
    add_column :agents, :available, :boolean
  end
end
