# frozen_string_literal: true

class CreateTranslationTableForArticleSettings < ActiveRecord::Migration[6.0]
  def change
    create_table :article_settings_translations do |_t|
      reversible do |dir|
        dir.up do
          ArticleSetting.create_translation_table! site_title: :string, site_description: :text
        end

        dir.down do
          ArticleSetting.drop_translation_table!
        end
      end
    end
  end
end
