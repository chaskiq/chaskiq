class CreateCampaigns < ActiveRecord::Migration[5.2]
  def change
    create_table :campaigns do |t|
      t.string :from_name
      t.string :from_email
      t.string :reply_email
      t.string :html_content
      t.string :serialized_content
      t.string :description
      t.string :name
      t.datetime :scheduled_at
      t.string :timezone
      t.string :state
      t.references :app, foreign_key: true
      t.jsonb :segments

      t.timestamps
    end
  end
end
