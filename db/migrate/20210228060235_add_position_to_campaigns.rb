class AddPositionToCampaigns < ActiveRecord::Migration[6.1]
  def change
    add_column :campaigns, :position, :integer
    add_index :campaigns, :position
  end
end
