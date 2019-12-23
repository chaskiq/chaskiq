# frozen_string_literal: true

class CreateTranslationTableForArticleCollections < ActiveRecord::Migration[6.0]
  def change
    create_table :article_collections_translations do |_t|
      reversible do |dir|
        dir.up do
          ArticleCollection.create_translation_table! title: :string, description: :text
        end

        dir.down do
          ArticleCollection.drop_translation_table!
        end
      end
    end
  end
end
