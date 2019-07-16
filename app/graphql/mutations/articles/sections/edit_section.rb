
module Mutations
  module Articles
    module Sections
      class EditSection < Mutations::BaseMutation
        
        field :section, Types::SectionType, null: false
        argument :app_key, String, required: true
        argument :collection_id, Integer, required: true
        argument :title, String, required: true
        argument :id, Integer, required: true

    
        def resolve(app_key: , collection_id: , title:, id:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.find(collection_id)
          section = collection.sections.find(id)
          section.update(title: title)

          {section: section}
        end


        def current_user
          context[:current_user]
        end
      end
    end
  end
end