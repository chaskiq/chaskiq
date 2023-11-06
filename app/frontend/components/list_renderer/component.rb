# frozen_string_literal: true

class ListRenderer::Component < ApplicationViewComponent
  option :field

  def action_method(action)
    return "click->definition-renderer#sendForm" if action.blank?

    case action["type"]
    when "frame" then "click->definition-renderer#visitFrame"
    when "submit", "url" then "click->definition-renderer#sendForm"
    when "link" then "click->definition-renderer#visitLink"
    end
  end
end
