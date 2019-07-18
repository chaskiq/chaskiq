class Article < ApplicationRecord
  include AASM

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

  has_many_attached :images

  accepts_nested_attributes_for :article_content

  scope :without_section, ->{ where(article_section_id: nil) }
  scope :with_section, ->{ where.not(article_section_id: nil) }

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
