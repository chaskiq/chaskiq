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

    def content
      object.article_content.as_json(only: %i[html_content serialized_content text_content])
      #lazy_content.as_json(only: %i[html_content serialized_content text_content])
    end

    def author
      BatchLoader::GraphQL.for(object.author_id).batch do |user_ids, loader|
        Agent.where(id: user_ids).each { |user| loader.call(user.id, user) }
      end
    end

  end
end
