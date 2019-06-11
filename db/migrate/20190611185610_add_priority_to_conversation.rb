class AddPriorityToConversation < ActiveRecord::Migration[6.0]
  def change
    add_column :conversations, :priority, :boolean
    add_index :conversations, :priority
  end
end
