# frozen_string_literal: true

class CreateArticleSettings < ActiveRecord::Migration[6.0]
  def change
    create_table :article_settings do |t|
      t.string :domain, uniq: true
      t.string :subdomain, uniq: true
      t.jsonb :properties, default: {} # null: false, default: '{}'
      t.references :app, null: false, foreign_key: true
      t.timestamps
    end
  end
end
