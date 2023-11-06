# frozen_string_literal: true

class ListRenderer::Component < ApplicationViewComponent
  option :field

  def action_method(action)
    return "click->definition-renderer#sendForm" if action.blank?

    action_map = {
      "url" => "click->definition-renderer#openUrl",
      "frame" => "click->definition-renderer#visitFrame",
      "submit" => "click->definition-renderer#sendForm",
      "link" => "click->definition-renderer#visitLink"
    }

    action_map[action["type"]]

  end
end
