# frozen_string_literal: true

class CreatePreviewCards < ActiveRecord::Migration[5.2]
  def change
    create_table :preview_cards do |t|
      t.integer :status_id
      t.string :url, null: false, default: ''

      t.string :title
      t.text :description
      t.string :image
      t.integer :image_file_size
      t.string :image_file_name
      t.string :image_file_type
      t.datetime :image_updated_at
      t.string :type
      t.text :html
      t.string :author_name
      t.string :author_url
      t.string :provider_name
      t.string :provider_url
      t.integer :width
      t.integer :height

      # t.attachment :image
      t.timestamps
    end
    add_index :preview_cards, :status_id, unique: true
  end
end
