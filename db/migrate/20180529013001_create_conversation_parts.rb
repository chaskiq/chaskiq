class CreateConversationParts < ActiveRecord::Migration[5.2]
  def change
    create_table :conversation_parts do |t|
      t.text :message
      t.datetime :read_at
      t.references :user, foreign_key: true
      t.references :conversation, foreign_key: true
      t.timestamps
    end
  end
end
