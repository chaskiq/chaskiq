# frozen_string_literal: true

module Mutations
  module Articles
    class AddArticlesToCollection < Mutations::BaseMutation
      field :collection, Types::CollectionType, null: false
      argument :app_key, String, required: true
      argument :collectionId, Integer, required: true
      argument :articlesId, [String], required: true

      def resolve(app_key:, collection_id:, articles_id:)
        app = App.find_by(key: app_key)

        collection = app.article_collections.find(collection_id)
        app.articles.where(id: articles_id).each do |a|
          a.update(collection: collection, section: nil)
        end

        { collection: collection }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
