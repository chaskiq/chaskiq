# frozen_string_literal: true

class CreateConversations < ActiveRecord::Migration[5.2]
  def change
    create_table :conversations do |t|
      t.string :key, index: true
      t.references :app, foreign_key: true
      t.references :assignee # , foreign_key: true
      t.jsonb :admins
      t.integer :reply_count
      t.integer :parts_count

      t.datetime :latest_admin_visible_comment_at
      t.datetime :latest_update_at
      t.datetime :latest_user_visible_comment_at
      t.datetime :read_at

      t.references :main_participant

      t.boolean :priority, index: true
      t.string :state

      t.timestamps
    end
  end
end
