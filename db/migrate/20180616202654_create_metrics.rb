# frozen_string_literal: true

class CreateMetrics < ActiveRecord::Migration[5.2]
  def change
    create_table :metrics do |t|
      t.references :campaign, index: true
      t.references :trackable, polymorphic: true, index: true, null: false
      t.string :action
      t.string :host
      t.jsonb :data, default: {}
      t.string :message_id, index: true
      t.timestamps
    end
  end
end
