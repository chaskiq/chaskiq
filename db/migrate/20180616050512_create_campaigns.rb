# frozen_string_literal: true

class CreateCampaigns < ActiveRecord::Migration[5.2]
  def change
    create_table :campaigns do |t|
      t.string :key, index: true
      t.string :from_name
      t.string :from_email
      t.string :reply_email
      t.text :html_content
      t.text :premailer
      t.text :serialized_content
      t.string :description
      t.boolean :sent
      t.string :name
      t.datetime :scheduled_at
      t.string :timezone
      t.string :state
      t.string :subject
      t.references :app, foreign_key: true
      t.jsonb :segments
      t.string :type, index: true, default: 'Campaign'
      t.jsonb :settings, default: {}
      t.datetime :scheduled_to
      t.timestamps
    end
  end
end
