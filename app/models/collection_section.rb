class CollectionSection < ApplicationRecord
  belongs_to :collection, class_name: "ArticleCollection", foreign_key: 'article_collection_id'
end
