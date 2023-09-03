# frozen_string_literal: true

class CreateTranslationTableForCollectionSetctions < ActiveRecord::Migration[6.0]
  def change
    create_table :collection_sections_translations do |_t|
      reversible do |dir|
        dir.up do
          CollectionSection.create_translation_table! title: :string, description: :text
        end

        dir.down do
          CollectionSection.drop_translation_table!
        end
      end
    end
  end
end
