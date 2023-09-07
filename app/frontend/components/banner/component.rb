# frozen_string_literal: true

class Banner::Component < ApplicationViewComponent
  option :mode, default: -> { "" }
  option :placement, default: -> { "" }
  option :bg_color, default: -> { "" }
  option :show_sender, default: -> { "" }
  option :action_text, default: -> { "" }
  option :dismiss_button, default: -> { "" }
  option :sender_data, default: -> { "" }
  option :url, default: -> { "" }
  option :font_options, default: -> { "" }
  option :editable, default: -> { true }
  option :serialized_content, default: -> { { content: [] }.to_json }

  def text_component
    # rubocop:disable Rails/OutputSafety
    raw Dante::Renderer.new(raw: JSON.parse(serialized_content).deep_symbolize_keys).render
    # rubocop:enable Rails/OutputSafety
  end

  def placement_option
    if placement == "top" && mode == "floating"
      { top: 8 }
    elsif placement == "top"
      { top: 0 }
    elsif placement == "bottom" && mode == "floating"
      { bottom: 8 }
    elsif placement == "bottom" || placement == "fixed"
      { bottom: 0 }
    end
  end

  def style_string
    hash = {
      position: "absolute",
      width: "100%",
      height: "72px"
      # fontSize: "16px",
    }.merge!(placement_option)

    style_string = hash.map { |key, value| "#{key}: #{value};" }.join(" ")
  end
end
