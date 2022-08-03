class AddBlockedFieldsToConversations < ActiveRecord::Migration[7.0]
  def change
    add_column :conversations, :blocked, :boolean
    add_column :conversations, :blocked_reason, :string
  end
end
