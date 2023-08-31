# frozen_string_literal: true

class AddBotToAgents < ActiveRecord::Migration[6.0]
  def change
    add_column :agents, :bot, :boolean
  end
end
