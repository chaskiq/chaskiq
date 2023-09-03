# frozen_string_literal: true

class CreateTranslationTableForArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :articles_translations do |_t|
      reversible do |dir|
        dir.up do
          Article.create_translation_table! title: :string, description: :text
        end

        dir.down do
          Article.drop_translation_table!
        end
      end
    end
  end
end
