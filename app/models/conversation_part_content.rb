# frozen_string_literal: true

class ConversationPartContent < ApplicationRecord
  # belongs_to :conversation_part

  def as_json(*)
    super.except('created_at',
                 'updated_at',
                 'id',
                 'conversation_part_id').tap do |hash|
    end
  end
end
