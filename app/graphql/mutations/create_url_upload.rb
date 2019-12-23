# frozen_string_literal: true

require 'open-uri'

module Mutations
  class CreateUrlUpload < GraphQL::Schema::Mutation
    class CreateUrlUploadInput < GraphQL::Schema::InputObject
      description 'File information required to prepare a direct upload'

      argument :url, String, 'remote Url file', required: true
    end

    argument :input, CreateUrlUploadInput, required: true

    class UrlUpload < GraphQL::Schema::Object
      description 'Represents direct upload credentials'

      field :url, String, 'Upload URL', null: false
      field :service_url, String, 'Service URL', null: false
      field :headers, String,
            'HTTP request headers (JSON-encoded)',
            null: false
      field :blob_id, ID, 'Created blob record ID', null: false
      field :signed_blob_id, ID,
            'Created blob record signed ID',
            null: false
    end

    field :direct_upload, UrlUpload, null: false

    def download_to_file(uri)
      stream = open(uri, 'rb')
      return stream if stream.respond_to?(:path) # Already file-like

      Tempfile.new.tap do |file|
        file.binmode
        IO.copy_stream(stream, file)
        stream.close
        file.rewind
      end
    end

    def resolve(input:)
      tmp_img = download_to_file(input.url)

      file = ActionDispatch::Http::UploadedFile.new(
        tempfile: tmp_img,
        filename: File.basename(tmp_img)
      )

      blob = ActiveStorage::Blob.create_after_upload!(
        io: file,
        filename: file.original_filename,
        content_type: file.content_type
      )

      {
        direct_upload: {
          url: blob.service_url_for_direct_upload,
          service_url: Rails.application.routes.url_helpers.rails_blob_path(blob),
          # NOTE: we pass headers as JSON since they have no schema
          headers: blob.service_headers_for_direct_upload.to_json,
          blob_id: blob.id,
          signed_blob_id: blob.signed_id
        }
      }
    end
  end
end

# add this mutation to your Mutation type
# field :create_direct_upload, mutation: CreateUrlUpload
