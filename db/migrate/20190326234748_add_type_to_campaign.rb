class AddTypeToCampaign < ActiveRecord::Migration[5.2]
  def change
    add_column :campaigns, :type, :string, index: true, default: "Campaign"
    add_column :campaigns , :settings, :jsonb , default: {}
    add_column :campaigns, :scheduled_to, :datetime
  end
end
