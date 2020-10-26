# frozen_string_literal: true

module Types
  class CollectionType < Types::BaseObject
    field :title, String, null: true
    field :id, Integer, null: true
    field :description, String, null: true
    field :slug, String, null: false
    field :sections, [Types::SectionType], null: true
    field :base_articles, [Types::ArticleType], null: true
    field :meta, Types::JsonType, null: true
    field :authors, [Types::AgentType], null: true

    def base_articles
      if current_user.blank?
        object.articles.published.without_section
      else
        object.articles.without_section
      end
    end

    def sections
      # current_user.blank? ?
      # object.sections.joins(:articles).group('collection_sections_id , articles.id') :
      object.sections
    end

    def authors
      articles = if current_user.blank?
                   object.articles.published
                 else
                   object.articles
                 end

      articles.map(&:author).uniq!
    end

    def meta
      articles = if current_user.blank?
                   object.articles.published
                 else
                   object.articles
                 end
      {
        size: articles.size,
        authors: articles.map(&:author).uniq!
      }
    end
  end
end
