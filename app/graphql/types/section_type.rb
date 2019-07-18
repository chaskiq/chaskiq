module Types
  class SectionType < Types::BaseObject
    field :title, String, null: true
    field :id, Integer, null: true
    field :description, String, null: true
    field :articles, [Types::ArticleType], null: false
  end
end