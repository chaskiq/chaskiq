class AddPositionToBotTasks < ActiveRecord::Migration[6.0]
  def change
    add_column :bot_tasks, :position, :integer
  end
end
