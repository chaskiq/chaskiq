class CollectionSection < ApplicationRecord
  belongs_to :collection, class_name: "ArticleCollection", foreign_key: 'article_collection_id'
  has_many :articles,  -> { order(position: :asc) }, foreign_key: 'article_section_id'
  acts_as_list scope: [:article_collection_id]
  extend FriendlyId
  friendly_id :title, use: :scoped, :scope => [:article_collection_id]
end
