# frozen_string_literal: true

module Mutations
  module Articles
    module Sections
      class DeleteSection < Mutations::BaseMutation
        field :section, Types::SectionType, null: false
        argument :app_key, String, required: true
        argument :id, String, required: true

        def resolve(app_key:, id:)
          app = current_user.apps.find_by(key: app_key)
          section = app.sections.find(id)
          section.articles.update_all(article_section_id: nil)
          section.destroy
          { section: section }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
