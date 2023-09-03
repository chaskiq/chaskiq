# frozen_string_literal: true

module Types
  class ArticleUrlType < Types::BaseObject
    field :id, String, null: false
    field :slug, String, null: false
    field :title, String, null: false
  end
end
