# frozen_string_literal: true

class CreateConversationPartBlocks < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_part_blocks do |t|
      t.jsonb :blocks
      t.string :state
      t.jsonb :data

      t.timestamps
    end
  end
end
