class ArticleCollection < ApplicationRecord
  belongs_to :app
  has_many :articles
  has_many :sections, class_name: "CollectionSection"
  has_many :articles
  acts_as_list scope: [:app_id]
  #belongs_to :author, class_name: "Agent", foreign_key: 'author_id'
end
