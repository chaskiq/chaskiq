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
end
