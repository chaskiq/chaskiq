class CreateOutgoingWebhooks < ActiveRecord::Migration[6.0]
  def change
    create_table :outgoing_webhooks do |t|
      t.string :state
      t.references :app, null: false, foreign_key: true
      t.string :url

      t.timestamps
    end
    add_index :outgoing_webhooks, :state
  end
end
