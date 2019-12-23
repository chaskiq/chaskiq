# frozen_string_literal: true

class CreateCollectionSections < ActiveRecord::Migration[6.0]
  def change
    create_table :collection_sections do |t|
      t.string :title
      t.string :slug, unique: true
      t.string :state
      t.integer :position
      t.references :article_collection, null: false, foreign_key: true
      t.text :description

      t.timestamps
    end
  end
end
