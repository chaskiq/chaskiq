class ArticleCollection < ApplicationRecord
  belongs_to :app
  has_many :articles
  has_many :sections, class_name: "CollectionSection"
end
