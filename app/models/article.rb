class Article < ApplicationRecord
  include AASM
  include GlobalizeAccessors

  belongs_to :author, class_name: "Agent"
  belongs_to :app
  belongs_to :collection, 
              class_name: "ArticleCollection", 
              foreign_key: 'article_collection_id',
              optional: true

  belongs_to :section, 
              class_name: "CollectionSection", 
              foreign_key: 'article_section_id',
              optional: true

  has_one :article_content

  acts_as_list scope: [:app_id, :article_collection_id, :article_section_id ]

  extend FriendlyId
  friendly_id :title, use: :scoped, :scope => [:app_id, :article_collection_id, :article_section_id ]

  has_many_attached :images

  translates :title, :description
  self.globalize_accessors :attributes => [:description, :title]

  accepts_nested_attributes_for :article_content

  scope :without_section, ->{ where(article_section_id: nil).order(position: :asc) }
  scope :with_section, ->{ where.not(article_section_id: nil).order(position: :asc) }
  scope :without_collection, ->{ where(article_collection_id: nil).order(position: :asc) }

  aasm column: :state do
    state :draft, :initial => true
    state :published

    event :publish , after: :set_published_at do
      transitions :from => :draft, :to => :published
    end
  end

  def set_published_at
    self.published_at = Time.zone.now
    self.save
  end

end
