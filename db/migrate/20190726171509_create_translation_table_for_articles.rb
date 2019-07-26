class CreateTranslationTableForArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :translation_table_for_articles do |t|

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
