# frozen_string_literal: true

class Banner::Component < ApplicationViewComponent
  option :mode, default: -> { "" }
  option :placement, default: -> { "top" }
  option :bg_color, default: -> { "#000" }
  option :show_sender, default: -> { true }
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
      { top: '8px' }
    elsif placement == "top"
      { top: '0px' }
    elsif placement == "bottom" && mode == "floating"
      { bottom: '8px' }
    elsif placement == "bottom" || placement == "fixed"
      { bottom: '0px' }
    end
  end

  def default_placement_option
    {top: '8px'}
  end

  def style_string
    hash = {
      position: "absolute",
      width: "100%",
      height: "72px"
      # fontSize: "16px",
    }.merge!(placement_option || default_placement_option)

    style_string = hash.map { |key, value| "#{key}: #{value};" }.join(" ")
  end
end
