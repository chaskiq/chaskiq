class AddSourceToConversationPart < ActiveRecord::Migration[6.0]
  def change
    add_column :conversation_parts, :source, :string
    add_index :conversation_parts, :source
    add_column :conversation_parts, :message_id, :integer
    add_index :conversation_parts, :message_id
  end
end
