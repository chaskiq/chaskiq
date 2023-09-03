# frozen_string_literal: true

class CreateConversationPartEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_part_events do |t|
      t.string :action
      t.jsonb :data

      t.timestamps
    end
  end
end
