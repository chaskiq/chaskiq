class AddSubdomainIndexToArticleSettings < ActiveRecord::Migration[6.1]
  def change
    add_index :article_settings, :subdomain, :unique => true
  end
end
