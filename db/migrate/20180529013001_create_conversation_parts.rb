# frozen_string_literal: true

class CreateConversationParts < ActiveRecord::Migration[5.2]
  def change
    create_table :conversation_parts do |t|
      t.string :key, index: true
      t.text :message
      t.datetime :read_at
      t.references :app_user, foreign_key: true
      t.references :conversation, foreign_key: true
      t.boolean :private_note, :boolean, index: true
      t.references :authorable, polymorphic: true, index: true
      t.references :messageable, polymorphic: true, index: true
      t.string :source, :string, index: true
      t.string :message_id, index: true
      t.string :email_message_id
      t.timestamps
    end
  end
end
