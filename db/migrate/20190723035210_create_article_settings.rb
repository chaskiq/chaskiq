class CreateArticleSettings < ActiveRecord::Migration[6.0]
  def change
    create_table :article_settings do |t|
      t.jsonb :properties, default: {} #null: false, default: '{}'
      t.references :app, null: false, foreign_key: true
      t.timestamps
    end
  end
end
