# frozen_string_literal: true

module Types
  class CollectionType < Types::BaseObject
    field :title, String, null: true
    field :id, String, null: true
    field :description, String, null: true
    field :slug, String, null: false
    field :sections, [Types::SectionType], null: true
    field :base_articles, [Types::ArticleType], null: true
    field :meta, Types::JsonType, null: true
    field :authors, [Types::AgentType], null: true

    field :icon, String, null: true
    def icon
      options = {
        resize: "200x200^",
        gravity: "center",
        # crop: '200x200+0+0',
        strip: true,
        quality: "86"
      }

      return "" if object.icon_blob.blank?

      Rails.application.routes.url_helpers.rails_representation_url(
        object.icon.variant(options).processed,
        only_path: true
      )
    end

    def base_articles
      if current_user.blank?
        object.articles.published.without_section
      else
        object.articles.without_section
      end
    end

    delegate :sections, to: :object

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
