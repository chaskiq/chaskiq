# frozen_string_literal: true

class ArticleSetting < ApplicationRecord
  include GlobalizeAccessors
  belongs_to :app

  store_accessor :properties, %i[
    social_media_buttons
    links
    color
    google_code
    site_description
    site_title
    website
    facebook
    twitter
    linkedin
    credits
    langs
    default_lang
  ]

  has_one_attached :logo
  has_one_attached :header_image

  validates :subdomain, uniqueness: true

  validates :subdomain,
            exclusion: { in: %w[www],
                         message: '%{value} is reserved.' },
            presence: true,
            uniqueness: true

  validates :website, url: true
  validates :color, hex: true, if: -> { color.present? }

  translates :site_description, :site_title
  globalize_accessors attributes: %i[site_description site_title]

  # before_validation :sanitize_subdomain
  # def sanitize_subdomain
  #  self.subdomain = self.subdomain.parameterize
  # end

  def logo_url
    return 'https://via.placeholder.com/100x100' unless logo_blob.present?
    url = begin
      logo.variant(resize_to_limit: [300, 100]).processed
    rescue StandardError
      nil
    end
    return nil if url.blank?

    Rails.application.routes.url_helpers.rails_representation_url(
      url
    )
  end

  def header_image_url
    return 'https://via.placeholder.com/1024x300' unless header_image_blob.present?

    url = begin
      header_image.variant(resize_to_limit: [100, 100]).processed
    rescue StandardError
      nil
    end
    return nil if url.blank?

    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        url
      )
    rescue StandardError
      nil
    end
  end
end
