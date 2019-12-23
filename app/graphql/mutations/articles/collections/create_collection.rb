# frozen_string_literal: true

module Mutations
  module Articles
    module Collections
      class CreateCollection < Mutations::BaseMutation
        field :collection, Types::CollectionType, null: false
        field :errors, Types::JsonType, null: false
        argument :app_key, String, required: true
        argument :title, String, required: true
        argument :description, String, required: false, default_value: ''
        argument :lang, String, required: false, default_value: I18n.default_locale

        def resolve(app_key:, title:, description:, lang:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.create(
            title: title,
            description: description,
            locale: lang
            # author: current_user
          )
          {
            collection: collection,
            errors: collection.errors
          }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
