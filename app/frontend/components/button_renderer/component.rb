# frozen_string_literal: true

class ButtonRenderer::Component < ApplicationViewComponent
  option :id
  option :variant, default: -> { "success" }
  option :size, default: -> { "md" }
  option :label
  option :align, default: -> { "left" }
  option :action, default: -> {}
  option :frame, default: -> {}

  def json_data
    { label: @label, id: @id, action: @action }.to_json
  end

  def action_method
    return "click->definition-renderer#sendForm" if @action.blank?
    case @action["type"]
    when "submit", "url" then "click->definition-renderer#sendForm"
    when "link" then "click->definition-renderer#visitLink"
    end
  end
end
