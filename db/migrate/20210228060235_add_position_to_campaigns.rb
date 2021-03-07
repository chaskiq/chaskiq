class AddPositionToCampaigns < ActiveRecord::Migration[6.1]
  def change
    add_column :campaigns, :position, :integer
    add_index :campaigns, :position

    reversible do |dir|
      dir.up do
        App.all.find_each do |app|
          app.messages.all.each.with_index(1) do |m, index|
            puts "updating campaign: #{m.id} with #{index} position"
            m.update_column(:position, index)
          end
        end
      end
    end
  end
end
