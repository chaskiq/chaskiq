# frozen_string_literal: true

module Mutations
  class CreateDirectUpload < GraphQL::Schema::Mutation
    class CreateDirectUploadInput < GraphQL::Schema::InputObject
      description 'File information required to prepare a direct upload'
      argument :filename, String, 'Original file name', required: true
      argument :byte_size, Int, 'File size (bytes)', required: true
      argument :checksum, String, 'MD5 file checksum as base64', required: true
      argument :content_type, String, 'File content type', required: true
    end

    argument :input, CreateDirectUploadInput, required: true

    class DirectUpload < GraphQL::Schema::Object
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

    field :direct_upload, DirectUpload, null: false

    def resolve(input:)
      blob = ActiveStorage::Blob.create_before_direct_upload!(input.to_h)
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
