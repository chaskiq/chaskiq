# frozen_string_literal: true

class AddFirstAgentReplyToConversations < ActiveRecord::Migration[6.0]
  def change
    add_column :conversations, :first_agent_reply, :datetime
  end
end
