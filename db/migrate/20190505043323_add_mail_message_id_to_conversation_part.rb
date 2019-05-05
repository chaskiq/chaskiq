class AddMailMessageIdToConversationPart < ActiveRecord::Migration[6.0]
  def change
    add_column :conversation_parts, :email_message_id, :string
  end
end
