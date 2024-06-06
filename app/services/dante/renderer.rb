# This Ruby code provides a Renderer class that can be used to convert ProseMirror JSON into HTML.
# The implementation closely follows the original JavaScript code,

class Dante::Renderer
  attr_accessor :raw, :html, :theme, :domain

  def initialize(raw:, html: nil, theme: nil, domain: Chaskiq::Config.get("HOST"))
    @raw = raw
    @html = html
    @theme = theme
    @domain = domain
  end

  def convert_node_to_element(node)
    case node[:type]
    when "heading"
      level = begin
        node[:attrs][:level]
      rescue StandardError
        2
      end
      tag = "h#{level}"
      create_element(tag, "graf graf--h", traverse_nodes(node[:content]))
    when "blockquote"
      create_element("blockquote", nil, traverse_nodes(node[:content]))
    when "paragraph"
      create_element("p", "graf graf--p", traverse_nodes(node[:content]))
    when "bulletList"
      create_element("ul", "graf graf--ul", traverse_nodes(node[:content]))
    when "listItem"
      create_element("li", "graf graf--li", traverse_nodes(node[:content]))
    when "codeBlock"
      create_element("pre", "graf graf--pre", traverse_nodes(node[:content]))
    when "text"
      handle_text_node(node)

    when "ImageBlock"
      renderer = Dante::ImageBlockRenderer.new(block_key: node[:id], data: node[:attrs], domain: domain)
      renderer.render

    when "FileBlock"
      renderer = Dante::FileBlockRenderer.new(block_key: node[:id], data: node[:attrs], domain: domain)
      renderer.render

    when "VideoBlock"
      renderer = Dante::VideoBlockRenderer.new(block_key: node[:id], data: node[:attrs])
      renderer.render

    when "DividerBlock"
      renderer = Dante::DividerBlockRenderer.new(block_key: node[:id], data: node[:attrs], domain: domain)
      renderer.render

    when "AudioRecorderBlock"
      renderer = Dante::AudioRecorderRenderer.new(block_key: node[:id], data: node[:attrs], domain: domain)
      renderer.render

    when "EmbedBlock"
      renderer = Dante::EmbedBlockRenderer.new(block_key: node[:id], data: node[:attrs])
      renderer.render
    else
      Rails.logger.debug { "no handler for node #{node}" }
      nil
    end
  end

  def handle_text_node(node)
    text_element = node[:text]

    if node[:marks].present?
      node[:marks].reduce(text_element) { |element, mark| handle_mark(element, mark, node) }
    else
      text_element
    end
  end

  def create_element(tag, klass, content, **attrs)
    attrs_string = attrs.map { |key, value| "#{key}=\"#{value}\"" }.join
    class_string = klass ? " class=\"#{klass}\" " : ""
    content_string = Array(content).join
    "<#{tag}#{class_string} #{attrs_string}>#{content_string}</#{tag}>"
  end

  def handle_mark(element, mark, node)
    case mark[:type]
    when "textStyle"
      color = mark[:attrs][:color].is_a?(Hash) && mark[:attrs][:color].key?(:color) ? mark[:attrs][:color][:color] : mark[:attrs][:color]
      create_element("span", nil, element, style: "color: #{color};")
    when "bold"
      create_element("strong", nil, element)
    when "italic"
      create_element("em", nil, element)
    when "code"
      create_element("code", "graf code", element)
    when "link"
      create_element("a", "graf markup--anchor markup--anchor-readOnly", element, href: mark[:attrs][:href], target: mark[:attrs][:target], rel: "noopener noreferrer nofollow")
    else
      Rails.logger.debug { "no handler for mark #{mark}" }
      element
    end
  end

  def traverse_nodes(nodes)
    return nil unless nodes

    nodes.map { |node| convert_node_to_element(node) }
  end

  def render
    rendered_content = traverse_nodes(raw[:content]).join(" ")
  end
end
