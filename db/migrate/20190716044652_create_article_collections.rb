class CreateArticleCollections < ActiveRecord::Migration[6.0]
  def change
    create_table :article_collections do |t|
      t.string :title
      t.jsonb :properties
      t.string :state
      t.text :description
      t.references :app, null: false, foreign_key: true

      t.timestamps
    end
  end
end
