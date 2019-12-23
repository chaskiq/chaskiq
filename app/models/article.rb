# frozen_string_literal: true

class Article < ApplicationRecord
  include AASM
  include GlobalizeAccessors
  include PgSearch::Model

  belongs_to :author, class_name: 'Agent'
  belongs_to :app
  belongs_to :collection,
             class_name: 'ArticleCollection',
             foreign_key: 'article_collection_id',
             optional: true

  belongs_to :section,
             class_name: 'CollectionSection',
             foreign_key: 'article_section_id',
             optional: true

  include PgSearch::Model
  pg_search_scope :search,
                  # against: [:title, :description]
                  # ignoring: :accents,
                  # using: [:trigram],
                  using: {
                    tsearch: { prefix: true }
                  },
                  associated_against: {
                    translations: %i[title description]
                  }

  has_one :article_content

  acts_as_list scope: %i[app_id article_collection_id article_section_id]

  extend FriendlyId
  friendly_id :title, use: :scoped, scope: %i[app_id article_collection_id article_section_id]

  has_many_attached :images

  translates :title, :description
  globalize_accessors attributes: %i[description title]

  accepts_nested_attributes_for :article_content

  scope :published, -> { where(state: 'published').order(position: :asc) }
  scope :drafts, -> { where(state: 'draft').order(position: :asc) }

  scope :without_section, -> { where(article_section_id: nil).order(position: :asc) }
  scope :with_section, -> { where.not(article_section_id: nil).order(position: :asc) }
  scope :without_collection, -> { where(article_collection_id: nil).order(position: :asc) }

  aasm column: :state do
    state :draft, initial: true
    state :published

    event :publish, after: :set_published_at do
      transitions from: :draft, to: :published
    end
  end

  def set_published_at
    self.published_at = Time.zone.now
    save
  end
end
