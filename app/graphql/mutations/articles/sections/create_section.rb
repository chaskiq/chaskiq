# frozen_string_literal: true

module Mutations
  module Articles
    module Sections
      class CreateSection < Mutations::BaseMutation
        field :section, Types::SectionType, null: false
        argument :app_key, String, required: true
        argument :collection_id, Integer, required: true
        argument :title, String, required: true
        argument :lang, String, required: false, default_value: I18n.default_locale

        def resolve(app_key:, collection_id:, title:, lang:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.find(collection_id)
          section = collection.sections.create(
            title: title,
            locale: lang
          )
          I18n.locale = lang

          { section: section }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
