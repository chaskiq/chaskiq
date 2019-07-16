class ArticleCollection < ApplicationRecord
  belongs_to :app
  has_many :articles
  has_many :sections
end
