# frozen_string_literal: true

class CreateConversationPartContents < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_part_contents do |t|
      t.references :conversation_part, index: true
      t.text :html_content
      t.text :serialized_content
      t.text :text_content

      t.timestamps
    end
  end
end
