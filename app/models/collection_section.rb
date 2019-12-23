# frozen_string_literal: true

class CollectionSection < ApplicationRecord
  # maybe we could just use ArticleCollection
  # model with a parent id and deprecate this class
  include GlobalizeAccessors
  belongs_to :collection, class_name: 'ArticleCollection', foreign_key: 'article_collection_id'
  has_many :articles, -> { order(position: :asc) }, foreign_key: 'article_section_id'
  acts_as_list scope: [:article_collection_id]
  extend FriendlyId
  friendly_id :title, use: :scoped, scope: [:article_collection_id]
  translates :title, :description
  globalize_accessors attributes: %i[description title]
end
