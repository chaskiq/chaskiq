class AddAuthorToConversationPart < ActiveRecord::Migration[6.0]
  def change
    add_reference :conversation_parts, :authorable, polymorphic: true, index: true
    add_reference :conversation_parts, :messageable, polymorphic: true, index: true
  end
end
