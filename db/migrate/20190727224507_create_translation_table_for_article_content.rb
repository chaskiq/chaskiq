# frozen_string_literal: true

class CreateTranslationTableForArticleContent < ActiveRecord::Migration[6.0]
  def change
    create_table :article_contents_translations do |_t|
      reversible do |dir|
        dir.up do
          ArticleContent.create_translation_table! serialized_content: :text
        end

        dir.down do
          ArticleContent.drop_translation_table!
        end
      end
    end
  end
end
