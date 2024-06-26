# frozen_string_literal: true

module Types
  class ArticleType < Types::BaseObject
    field :id, String, null: false
    field :slug, String, null: true
    field :state, String, null: true
    field :title, String, null: true
    field :description, String, null: true
    field :position, Integer, null: true
    field :content, Types::JsonType, null: true
    field :author, Types::AgentType, null: true
    field :collection, Types::CollectionType, null: true
    field :section, Types::SectionType, null: true
    field :updated_at, type: GraphQL::Types::ISO8601DateTime, null: true
    field :updated_at_ago, type: String, null: true

    field :next_article_url, type: Types::ArticleUrlType, null: true
    field :prev_article_url, type: Types::ArticleUrlType, null: true

    def next_article_url
      return nil if object.position.blank?
      return nil if object.collection.blank?

      object.collection.articles.published.where("position > ?", object.position)&.first
    end

    def prev_article_url
      return nil if object.position.blank?
      return nil if object.collection.blank?

      object.collection.articles.published.where("position < ?", object.position)&.first
    end

    def content
      object.article_content.as_json(only: %i[html_content serialized_content text_content])
      # lazy_content.as_json(only: %i[html_content serialized_content text_content])
    end
  end
end
