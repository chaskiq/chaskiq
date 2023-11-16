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

    action_mappings = {
      "frame" => "click->definition-renderer#visitFrame",
      "submit" => "click->definition-renderer#sendForm",
      "url" => "click->definition-renderer#openUrl",
      "link" => "click->definition-renderer#visitLink",
      "content" => "click->definition-renderer#openContent"
    }

    result = action_mappings[@action["type"]]
  end
end
