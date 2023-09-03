class AddDataToConversationChannel < ActiveRecord::Migration[7.0]
  def change
    add_column :conversation_channels, :data, :jsonb
  end
end
