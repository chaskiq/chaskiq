# frozen_string_literal: true

module Mutations
  module Articles
    class ReorderArticle < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :position, Integer, required: true
      argument :section, String, required: false, default_value: nil
      argument :collection, String, required: false, default_value: nil

      def resolve(app_key:, id:, position:, section:, collection:)
        app = App.find_by(key: app_key)
        article = app.articles.find(id)
        collection = app.article_collections.find(collection)
        section = collection.sections.where(id: section).first

        article.update(collection: collection, section: section)

        article.insert_at(position + 1)

        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
