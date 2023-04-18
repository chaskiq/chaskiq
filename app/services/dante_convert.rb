class DanteConvert
  def self.extract_plain_text(nodes)
    text = ""

    nodes.each do |node|
      if node["type"] == "text"
        text += node["text"]
      elsif node["content"]
        text += extract_plain_text(node["content"])
      end
    end

    text
  end
end
