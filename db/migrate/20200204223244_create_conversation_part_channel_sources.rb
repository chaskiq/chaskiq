class CreateConversationPartChannelSources < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_part_channel_sources do |t|
      t.references :conversation_part, null: false, foreign_key: true
      t.string :provider
      t.string :message_source_id

      t.timestamps
    end
    add_index :conversation_part_channel_sources, :provider
    add_index :conversation_part_channel_sources, :message_source_id
  end
end
