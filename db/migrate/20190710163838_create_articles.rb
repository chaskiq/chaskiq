# frozen_string_literal: true

class CreateArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :articles do |t|
      t.string :title
      t.string :state
      t.string :slug, unique: true
      t.string :published_at
      t.integer :position
      t.references :app, null: false
      t.references :author, null: false # , foreign_key: true
      t.references :article_collection, index: true
      t.references :article_section, index: true
      t.timestamps
    end
    add_index :articles, :slug
  end
end
