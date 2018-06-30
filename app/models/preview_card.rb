class PreviewCard < ApplicationRecord

    include Rails.application.routes.url_helpers

    IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'].freeze

    self.inheritance_column = false

    enum type: [:link, :photo, :video, :rich]

    #mount_uploader :image, PreviewUploader
    has_one_attached :image

    validates :url, presence: true

    def save_with_optional_image!
      save!
    rescue ActiveRecord::RecordInvalid
      self.image = nil
      save!
    end

    def images
      image_url = self.image.attached? ? url_for(self.image) : nil
      [{url: image_url}]
    end

    def provider_url
      Addressable::URI.parse(self.url).site
    end

    def media
      {html: self.html}
    end

    def as_oembed_json(opts={})
      as_json(only: [:url, :title, :description, :html], 
              methods: [:provider_url, :images, :media] )
    end


end
