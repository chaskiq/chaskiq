# frozen_string_literal: true

class ConversationPartContent < ApplicationRecord
  include SanitizeHelpers

  has_one :conversation_part, as: :messageable, dependent: :destroy_async

  before_save :sanitize_contents

  def as_json(*)
    super.except("created_at",
                 "updated_at",
                 "id",
                 "conversation_part_id")
  end

  def sanitize_contents
    self.html_content = sanitize_field(html_content)
    self.text_content = sanitize_field(text_content)
  end

  def parsed_content
    JSON.parse(serialized_content)
  end

  def text_from_serialized
    parsed_content["blocks"].map { |o| o["text"] }.join(" ")
  rescue StandardError
    html_content
  end
end
