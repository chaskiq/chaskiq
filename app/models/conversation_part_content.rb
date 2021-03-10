# frozen_string_literal: true

class ConversationPartContent < ApplicationRecord
  # belongs_to :conversation_part

  def as_json(*)
    super.except('created_at',
                 'updated_at',
                 'id',
                 'conversation_part_id')
  end

  def parsed_content
    JSON.parse(serialized_content)
  end

  def text_from_serialized
    parsed_content['blocks'].map { |o| o['text'] }.join(' ')
  rescue StandardError
    html_content
  end
end
