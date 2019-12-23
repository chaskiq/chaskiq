# frozen_string_literal: true

class PreviewCard < ApplicationRecord
  include Rails.application.routes.url_helpers

  IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'].freeze

  self.inheritance_column = false

  enum type: %i[link photo video rich]

  # mount_uploader :image, PreviewUploader
  has_one_attached :image

  validates :url, presence: true

  def save_with_optional_image!
    save!
  rescue ActiveRecord::RecordInvalid
    self.image = nil
    save!
  end

  def images
    image_url = image.attached? ? url_for(image) : nil
    [{ url: image_url }]
  end

  def provider_url
    Addressable::URI.parse(url).site
  end

  def media
    { html: html }
  end

  def as_oembed_json(_opts = {})
    as_json(only: %i[url title description html],
            methods: %i[provider_url images media])
  end
end
