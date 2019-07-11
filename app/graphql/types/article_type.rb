module Types
  class ArticleType < Types::BaseObject

    field :id, String, null: false
    field :slug, String, null: true
    field :state, String, null: true
    field :title, String, null: true
    field :content, Types::JsonType, null: true
    field :author, Types::AgentType, null: true

    def content
      object.article_content.as_json(only: [ :html_content, :serialized_content, :text_content] )
    end
  end
end
