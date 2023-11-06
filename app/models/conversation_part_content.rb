# frozen_string_literal: true

class ConversationPartContent < ApplicationRecord
  has_one :conversation_part, as: :messageable, dependent: :destroy_async

  def as_json(*)
    super.except("created_at",
                 "updated_at",
                 "id",
                 "conversation_part_id")
  end

  def self.ransackable_attributes(auth_object = nil)
    %w[conversation_part_id created_at html_content id id_value serialized_content text_content updated_at]
  end

  def parsed_content
    JSON.parse(serialized_content)
  end

  def html_from_serialized
    return if serialized_content.blank?

    json = begin
      JSON.parse(serialized_content)
    rescue StandardError
      nil
    end
    return if json.blank?

    data = ActiveSupport::HashWithIndifferentAccess.new(json)
    return "" if data.blank?
    return "" if data["content"].blank?

    Dante::Renderer.new(raw: data).render
  end

  def text_from_serialized
    Dante::Utils.extract_plain_text(parsed_content["content"])
    # parsed_content["blocks"].map { |o| o["text"] }.join(" ")
  rescue StandardError
    html_content
  end
end
