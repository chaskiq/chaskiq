# frozen_string_literal: true

module Mutations
  module Articles
    class ChangeCollectionArticle < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :collection_id, Integer, required: true

      def resolve(app_key:, id:, collection_id:)
        app = App.find_by(key: app_key)
        article = app.articles.find(id)

        collection = app.article_collections.find(collection_id)

        article.update(collection: collection)

        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
