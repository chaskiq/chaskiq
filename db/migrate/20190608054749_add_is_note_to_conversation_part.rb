class AddIsNoteToConversationPart < ActiveRecord::Migration[6.0]
  def change
    add_column :conversation_parts, :private_note, :boolean, index: true
  end
end
