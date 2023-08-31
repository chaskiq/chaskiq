# frozen_string_literal: true

class CreateTranslationTableForApp < ActiveRecord::Migration[6.0]
  def change
    create_table :apps_translations do |_t|
      reversible do |dir|
        dir.up do
          App.create_translation_table! greetings: :text, intro: :text, tagline: :text
        end

        dir.down do
          App.drop_translation_table!
        end
      end
    end
  end
end
