class Dante::Utils
  def self.extract_plain_text(nodes)
    text = ""
    nodes.each do |node|
      if node["type"] == "text"
        text += "#{node['text']} "
      elsif node["content"]
        text += extract_plain_text(node["content"])
      end
    end
    text
  end

  def self.get_blocks(serialized_content)
    JSON.parse(serialized_content)["content"]
  end
end
