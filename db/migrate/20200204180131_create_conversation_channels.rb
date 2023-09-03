class CreateConversationChannels < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_channels do |t|
      t.string :provider
      t.string :provider_channel_id
      t.references :conversation, null: false, foreign_key: true

      t.timestamps
    end
    add_index :conversation_channels, :provider
    add_index :conversation_channels, :provider_channel_id
  end
end
