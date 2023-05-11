require "action_view"

class MessageApis::BlockManager
  include ActionView::Helpers::SanitizeHelper

  def self.get_blocks(serialized_content)
    Dante::Utils.get_blocks(serialized_content)
    # blocks = JSON.parse(
    #  serialized_content
    # )["blocks"]
  end

  def self.plain_text(blocks)
    Dante::Utils.extract_plain_text(blocks)
    # blocks.map do |o|
    #  o["text"]
    # end.join("\r\n")
  end

  # draft to pm
  def self.block_mapping(type)
    {
      "file" => "FileBlock",
      "recorded-audio" => "AudioRecorderBlock",
      "image" => "ImageBlock",
      "unstyled" => "text",
      "divider" => "DividerBlock",
      "header-one" => "heading",
      "header-two" => "heading",
      "header-three" => "heading",
      "header-four" => "heading"
    }[type]
  end

  def self.block_data(block)
    # block["data"]
    block["attrs"]
  end

  def self.serialized_text(text)
    {
      type: "doc",
      content: [{ type: "text", text: text.to_s }]
    }.to_json

    # key = ("a".."z").to_a.sample(8).join

    # {
    #  "blocks" => [
    #    { "key" => key, "text" => text.to_s, "type" => "unstyled", "depth" => 0, "inlineStyleRanges" => [], "entityRanges" => [], "data" => {} }
    #  ],
    #  "entityMap" => {}
    # }
  end
end
