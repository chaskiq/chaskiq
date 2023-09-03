class Dante::Utils
  def self.extract_plain_text(nodes)
    nodes.inject("") do |text, node|
      case node["type"]
      when "text"
        text << "#{node['text']} "
      else
        node_content = node["content"]
        text << extract_plain_text(node_content) if node_content
      end
      text
    end.strip
  end

  def self.get_blocks(serialized_content)
    JSON.parse(serialized_content)["content"]
  end
end
