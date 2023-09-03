class AddClosedAtToConversation < ActiveRecord::Migration[6.1]
  def change
    add_column :conversations, :closed_at, :datetime
  end
end
