
module Mutations
  module Articles
    module Sections
      class CreateSection < Mutations::BaseMutation
        
        field :section, Types::SectionType, null: false
        argument :app_key, String, required: true
        argument :collection_id, Integer, required: true
        argument :title, String, required: true

    
        def resolve(app_key: , collection_id: , title:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.find(collection_id)
          section = collection.sections.create(title: title)

          {section: section}
        end


        def current_user
          context[:current_user]
        end
      end
    end
  end
end