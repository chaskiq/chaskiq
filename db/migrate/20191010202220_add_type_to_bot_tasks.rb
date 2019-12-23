# frozen_string_literal: true

class AddTypeToBotTasks < ActiveRecord::Migration[6.0]
  def change
    add_column :bot_tasks, :type, :string
    add_index :bot_tasks, :type
  end
end
