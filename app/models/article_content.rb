# frozen_string_literal: true

class ArticleContent < ApplicationRecord
  include GlobalizeAccessors

  belongs_to :article

  has_many_attached :images

  translates :serialized_content
  globalize_accessors attributes: [:serialized_content]
end
