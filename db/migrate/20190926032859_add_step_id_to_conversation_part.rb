# frozen_string_literal: true

class AddStepIdToConversationPart < ActiveRecord::Migration[6.0]
  def change
    add_column :conversation_parts, :step_id, :string
    add_column :conversation_parts, :trigger_id, :string
  end
end
