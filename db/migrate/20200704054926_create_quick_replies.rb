class CreateQuickReplies < ActiveRecord::Migration[6.0]
  def change
    create_table :quick_replies do |t|
      t.string :title
      t.text :content
      t.references :app, null: false, foreign_key: true

      t.timestamps
    end
  end
end
