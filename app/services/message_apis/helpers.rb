module MessageApis
  module Helpers
    extend ActiveSupport::Concern

    def keygen
      ("a".."z").to_a.sample(8).join
    end

    def main_doc(blocks)
      {
        type: "doc",
        content: blocks
      }
    end

    def text_block(text)
      # lines = text.split("\n").delete_if(&:empty?)
      # {
      #  blocks: lines.map { |o| serialized_block(o) },
      #  entityMap: {}
      # }.to_json

      lines = text.split("\n").delete_if(&:empty?)
      main_doc(lines.map { |o| serialized_block(o) }).to_json
    end

    def gif_block(url:, text:)
      {
        type: "VideoRecorderBlock",
        content: [],
        attrs: {
          caption: text.to_s,
          forceUpload: false,
          url: url,
          width: 100,
          height: 100,
          loading_progress: 0,
          selected: false,
          file: {},
          recording: false,
          granted: true,
          loading: false,
          direction: "center"
        }.merge(data_options)
      }
    end

    def photo_block(url:, text:, w: nil, h: nil)
      data_options = {}
      if w.present? && h.present?
        data_options = {
          aspect_ratio: get_aspect_ratio(w.to_f, h.to_f),
          width: w.to_i,
          height: h.to_i
        }
      end

      {
        type: "ImageBlock",
        content: [],
        attrs: {
          caption: text.to_s,
          forceUpload: false,
          url: url,
          width: 100,
          height: 100,
          loading_progress: 0,
          selected: false,
          loading: true,
          file: {},
          direction: "center"
        }.merge(data_options)
      }
    end

    def file_block(url:, text:)
      {
        type: "FileBlock",
        content: [],
        attrs: {
          caption: text.to_s,
          forceUpload: false,
          url: url,
          loading_progress: 0,
          selected: false,
          loading: true,
          file: {},
          direction: "center"
        }
      }
    end

    def serialized_block(text)
      { type: "text", text: text.to_s }
    end

    def get_aspect_ratio(w, h)
      maxWidth = 1000
      maxHeight = 1000
      ratio = 0
      width = w # Current image width
      height = h # Current image height

      # Check if the current width is larger than the max
      if width > maxWidth
        ratio = maxWidth / width # get ratio for scaling image
        height *= ratio # Reset height to match scaled image
        width *= ratio # Reset width to match scaled image

        # Check if current height is larger than max
      elsif height > maxHeight
        ratio = maxHeight / height # get ratio for scaling image
        width *= ratio # Reset width to match scaled image
        height *= ratio # Reset height to match scaled image
      end

      fill_ratio = (height / width) * 100
      { width: width, height: height, ratio: fill_ratio }
      # console.log result
    end

    def attachment_block(blocks)
      # {
      #  blocks: blocks,
      #  entityMap: {}
      # }.to_json
      main_doc(blocks).to_json
    end

    def direct_upload(file:, filename:, content_type:)
      blob = ActiveStorage::Blob.create_and_upload!(
        io: file,
        filename: filename,
        content_type: content_type,
        identify: false
      )
      {
        url: Rails.application.routes.url_helpers.rails_blob_path(blob)
      }.merge!(ActiveStorage::Analyzer::ImageAnalyzer::ImageMagick.new(blob).metadata)
    end

    def find_channel(id)
      ConversationPartChannelSource.find_by(
        provider: self.class::PROVIDER,
        message_source_id: id
      )
    end

    def process_read(id)
      conversation_part_channel = find_channel(id)
      return if conversation_part_channel.blank?

      conversation_part_channel.conversation_part.read!
    end

    def build_conn
      Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
    end

    def find_conversation_by_channel(provider, channel)
      conversation = @package
                     .app
                     .conversations
                     .joins(:conversation_channels)
                     .where(
                       "conversation_channels.provider =? AND
        conversation_channels.provider_channel_id =?",
                       provider, channel
                     ).first
    end

    def add_participant(user_data, provider)
      app = @package.app

      if user_data

        profile_data = {
          name: "#{user_data['first_name']} #{user_data['last_name']}"
        }

        data = {
          properties: profile_data
        }

        external_profile = app.external_profiles.find_by(
          provider: provider,
          profile_id: user_data["id"]
        )

        participant = external_profile&.app_user

        ## todo: check user for this & previous conversation
        if participant.blank?
          participant = app.add_anonymous_user(data)
          participant.external_profiles.create(
            provider: provider,
            profile_id: user_data["id"]
          )
        end

        participant
      end
    end

    # useed in controller hooks
    def serialize_content_from_html(message)
      message = sanitize(message, tags: %W[p br img a \n])
      doc = Nokogiri::HTML.parse(message)

      doc.css("br").each do |node|
        node.replace(Nokogiri::XML::Text.new("\n", doc))
      end

      lines = doc.css("body").inner_html.gsub(%r{<p>|</p>}, "")
      lines = lines.split("\n").delete_if(&:empty?)

      # [{ type: "paragraph", content: [{ type: "text", text: "foobar" }] }]

      blocks = lines.map do |o|
        if o.include?("<img src=")
          process_image_from_html(o)
        else
          serialized_block(o)
        end
      end
      main_doc(blocks).to_json

      # {
      #  blocks: lines.map do |o|
      #    if o.include?("<img src=")
      #      process_image_from_html(o)
      #    else
      #      serialized_block(o)
      #    end
      #  end,
      #  entityMap: {}
      # }.to_json
    end

    def process_image_from_html(o)
      img = Nokogiri::HTML.parse(o).css("img")
      url = img.attr("src")&.value
      w = img.attr("width")&.value
      h = img.attr("height")&.value
      title = img.attr("title")&.value
      photo_block(url: url, text: title, w: w, h: h)
    end
  end
end
