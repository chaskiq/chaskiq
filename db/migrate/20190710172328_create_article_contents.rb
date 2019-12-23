# frozen_string_literal: true

class CreateArticleContents < ActiveRecord::Migration[6.0]
  def change
    create_table :article_contents do |t|
      t.text :html_content
      t.text :serialized_content
      t.text :text_content
      t.references :article, null: false

      t.timestamps
    end
  end
end
