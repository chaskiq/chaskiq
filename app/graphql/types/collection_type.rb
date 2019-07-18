module Types
  class CollectionType < Types::BaseObject
    field :title, String, null: true
    field :id, Integer, null: true
    field :description, String, null: true
    
    field :sections, [Types::SectionType], null: true
    field :base_articles, [Types::ArticleType], null: true

    def base_articles
      object.articles.without_section
    end

    def sections
      h = {}
      return object.sections
      
      #arr = object.sections.map do |o|
      #  { 
      #    id: o.id,
      #    title: o.title, 
      #    description: o.description, 
      #    articles: o.articles
      #  }
      #end

      #if base_articles = object.articles.without_section and base_articles.any?
      #  arr << {
      #    id: "base",
      #    title: "base", 
      #    description: "base", 
      #    articles: base_articles
      #  }
      #end

      #arr

    end
  end
end