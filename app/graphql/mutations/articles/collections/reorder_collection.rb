# frozen_string_literal: true

module Mutations
  module Articles
    module Collections
      class ReorderCollection < Mutations::BaseMutation
        field :collection, Types::CollectionType, null: false
        argument :app_key, String, required: true
        argument :id, String, required: true
        argument :id_after, String, required: true

        def resolve(app_key:, id:, id_after:)
          app = current_user.apps.find_by(key: app_key)

          article_collection = app.article_collections
          collection = article_collection.find(id)
          position = article_collection.find(id_after).position

          collection.insert_at(position)

          { collection: collection }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
