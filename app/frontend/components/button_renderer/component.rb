# frozen_string_literal: true

class ButtonRenderer::Component < ApplicationViewComponent
  option :id
  option :variant, default: -> { "success" }
  option :size, default: -> { "md" }
  option :label
  option :align, default: -> { "left" }
  option :action, default: -> {}

  def json_data
    { label: @label, id: @id, action: @action }.to_json
  end

  def action_method
    case @action["type"]
    when "submit" then "click->definition_renderer#sendForm"
    when "link" then "click->definition_renderer#visitLink"
    end
  end
end
