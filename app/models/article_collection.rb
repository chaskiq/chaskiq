# frozen_string_literal: true

class ArticleCollection < ApplicationRecord
  include GlobalizeAccessors

  belongs_to :app
  has_many :articles, dependent: :nullify
  has_many :sections, class_name: "CollectionSection", dependent: :nullify
  acts_as_list scope: [:app_id]
  extend FriendlyId
  friendly_id :title, use: :scoped, scope: [:app_id]
  # belongs_to :author, class_name: "Agent", foreign_key: 'author_id'
  translates :title, :description
  globalize_accessors attributes: %i[description title]
  has_one_attached :icon
end
