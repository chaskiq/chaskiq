class CreateConversationSources < ActiveRecord::Migration[6.0]
  def change
    create_table :conversation_sources do |t|
      t.references :conversation, null: false, foreign_key: true
      t.references :app_package_integration, null: false, foreign_key: true

      t.timestamps
    end
  end
end
