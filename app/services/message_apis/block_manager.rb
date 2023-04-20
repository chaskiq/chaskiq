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
      "image" => "ImageBlock"
    }[type]
  end

  def self.serialized_text(text)
    {
      type: "doc",
      content: [{ type: "text", text: text.to_s }]
    }.to_json

    # "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
  end
end
