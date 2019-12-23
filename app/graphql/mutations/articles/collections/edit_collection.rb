# frozen_string_literal: true

module Mutations
  module Articles
    module Collections
      class EditCollection < Mutations::BaseMutation
        field :collection, Types::CollectionType, null: false
        field :errors, Types::JsonType, null: false
        argument :app_key, String, required: true
        argument :title, String, required: true
        argument :description, String, required: false
        argument :id, Integer, required: true
        argument :lang, String, required: false, default_value: I18n.default_locale

        def resolve(app_key:, title:, id:, description:, lang:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.find(id)

          collection.update(
            title: title,
            description: description,
            locale: lang
          )

          { collection: collection, errors: collection.errors }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
