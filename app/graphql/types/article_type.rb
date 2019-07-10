module Types
  class ArticleType < Types::BaseObject

    field :id, String, null: true
    field :slug, String, null: true
    field :state, String, null: true
    field :title, String, null: true
    field :content, Types::JsonType, null: true

    def content
      object.article_content
    end
  end
end
