module Types
  class CollectionType < Types::BaseObject
    field :title, String, null: true
    field :id, Integer, null: true
    field :description, String, null: true
    field :slug, String, null: false
    field :sections, [Types::SectionType], null: true
    field :base_articles, [Types::ArticleType], null: true
    field :meta, Types::JsonType, null: true

    def base_articles
      current_user.blank? ? 
      object.articles.published.without_section : 
      object.articles.without_section
    end

    def sections
      current_user.blank? ? 
      object.sections.joins(:articles).group("collection_sections.id , articles.id") :
      object.sections
    end

    def meta

      articles = current_user.blank? ? 
      object.articles.published : 
      object.articles

      {
        size: articles.size,
        authors: articles.map(&:author).uniq!
      }
    end
  end
end