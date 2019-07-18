class CollectionSection < ApplicationRecord
  belongs_to :collection, class_name: "ArticleCollection", foreign_key: 'article_collection_id'
  has_many :articles, foreign_key: 'article_section_id'

end
