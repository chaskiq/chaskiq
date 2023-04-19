require "action_view"

class MessageApis::BlockManager
  include ActionView::Helpers::SanitizeHelper

  def self.get_blocks(serialized_content)
    blocks = JSON.parse(
      serialized_content
    )["blocks"]
  end

  def self.plain_text(blocks)
    blocks.map do |o|
      o["text"]
    end.join("\r\n")
  end

  def self.extract_plain_text(nodes)
    # text = ""

    # nodes.each do |node|
    #  if node["type"] == "text"
    #    text += node["text"]
    #  elsif node["content"]
    #    text += extract_plain_text(node["content"])
    #  end
    # end

    # text
  end
end
