module MessageApis
  module Helpers
    extend ActiveSupport::Concern

    def keygen
      ('a'..'z').to_a.sample(8).join
    end

    def text_block(text)
      lines = text.split("\n").delete_if(&:empty?)
      {
        blocks: lines.map { |o| serialized_block(o) },
        entityMap: {}
      }.to_json
    end

    def gif_block(url:, text:)
      {
        key: keygen,
        text: text,
        type: 'recorded-video',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {
          rejectedReason: '',
          secondsLeft: 0,
          fileReady: true,
          paused: false,
          url: url,
          recording: false,
          granted: true,
          loading: false,
          direction: 'center'
        }
      }
    end

    def photo_block(url:, text:, w: nil, h: nil)
      data_options = {}
      data_options = {
        aspect_ratio: get_aspect_ratio(w.to_f, h.to_f),
        width: w.to_i,
        height: h.to_i,
      } if w.present? && h.present?
      {
        key: keygen,
        text: text,
        type: 'image',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {
          caption: text,
          forceUpload: false,
          url: url,
          width: 100,
          height: 100,
          loading_progress: 0,
          selected: false,
          loading: true,
          file: {},
          direction: 'center'
        }.merge(data_options)
      }
    end

    def file_block(url:, text:)
      {
        key: keygen,
        text: text,
        type: 'file',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {
          caption: text,
          forceUpload: false,
          url: url,
          loading_progress: 0,
          selected: false,
          loading: true,
          file: {},
          direction: 'center'
        }
      }
    end

    def serialized_block(text)
      {
        key: keygen,
        text: text,
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {}
      }
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

    def direct_upload(file:, filename:, mime_type: )
      blob = ActiveStorage::Blob.create_and_upload!(
        io: file,
        filename: filename,
        content_type: mime_type,
        identify: false
      )
      {
        url: Rails.application.routes.url_helpers.rails_blob_path(blob)
      }.merge!(ActiveStorage::Analyzer::ImageAnalyzer.new(blob).metadata)
    end
  end
end
