require "json"

class Dante::Converter
  def self.draftjs_to_prosemirror(draftjs_content)
    content_state = JSON.parse(draftjs_content, symbolize_names: true)
    blocks = content_state[:blocks]
    entity_map = content_state[:entityMap]

    prosemirror_nodes = blocks.map do |block|
      convert_block_to_prosemirror_node(block, entity_map)
    end

    { type: "doc", content: prosemirror_nodes }
  end

  def self.convert_block_to_prosemirror_node(block, entity_map)
    node = {
      type: convert_block_type(block[:type]),
      content: convert_inline_styles(block, entity_map)
    }

    if node[:type] == "heading"
      a = { "one" => 1, "two" => 2, "three" => 3 }
      node[:attrs] = { level: a[block[:type].split("-").last] || 0 }
    end

    node[:attrs] = block[:data] if %w[DividerBlock ImageBlock EmbedBlock VideoBlock VideoRecorderBlock AudioRecorderBlock].include?(node[:type])

    node
  end

  def self.convert_inline_styles(block, entity_map)
    text = block[:text]
    inline_style_ranges = block[:inlineStyleRanges]
    entity_ranges = block[:entityRanges]

    nodes = []
    position = 0

    while position < text.length
      style = inline_style_ranges.select { |range| position >= range[:offset] && position < (range[:offset] + range[:length]) }
      marks = style.flat_map { |s| convert_style_to_marks(s[:style]) }

      entity_range = entity_ranges.find { |range| position >= range[:offset] && position < (range[:offset] + range[:length]) }
      if entity_range
        entity = entity_map[entity_range[:key].to_s.to_sym]
        marks << { type: "link", attrs: { href: entity[:data][:url] } } if entity[:type] == "LINK"
      end

      next_position_ranges = style.map { |s| s[:offset] + s[:length] } + entity_ranges.map { |range| range[:offset] + range[:length] }
      next_position = next_position_ranges.select { |pos| pos > position }.min || text.length
      nodes << {
        type: "text",
        text: text[position...next_position],
        marks: marks
      }
      position = next_position
    end

    nodes
  end

  def self.convert_block_type(draftjs_block_type)
    case draftjs_block_type
    when "header-one", "header-two", "header-three", "header-four", "header-five", "header-six"
      "heading"
    when "unordered-list-item"
      "listItem"
    when "code-block"
      "codeBlock"
    when "blockquote"
      "blockquote"
    when "image"
      "ImageBlock"
    when "video"
      "VideoBlock"
    when "embed"
      "EmbedBlock"
    when "divider"
      "DividerBlock"
    when "video-recorder"
      "VideoRecorderBlock"
    when "audio-recorder"
      "AudioRecorderBlock"
    else
      "paragraph"
    end
  end

  def self.convert_style_to_marks(style)
    marks = []

    marks << { type: "bold" } if style.include?("BOLD")
    marks << { type: "italic" } if style.include?("ITALIC")
    marks << { type: "code" } if style.include?("CODE")
    marks << { type: "textStyle", attrs: { color: style.match(/CUSTOM_COLOR_(#[0-9a-fA-F]{6})/)&.captures&.first } } if style.include?("CUSTOM_COLOR")

    marks
  end
end
