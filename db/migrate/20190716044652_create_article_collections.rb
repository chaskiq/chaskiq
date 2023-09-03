# frozen_string_literal: true

class CreateArticleCollections < ActiveRecord::Migration[6.0]
  def change
    create_table :article_collections do |t|
      t.string :title
      t.jsonb :properties
      t.string :slug, unique: true
      t.string :state
      t.text :description
      t.integer :position
      t.references :app, null: false, foreign_key: true

      t.timestamps
    end
  end
end
