class AddTranslationTablesForQuickReplies < ActiveRecord::Migration[6.0]
  def change
    create_table :quick_replies_translations do |_t|
      reversible do |dir|
        dir.up do
          QuickReply.create_translation_table! content: :text
        end

        dir.down do
          QuickReply.drop_translation_table!
        end
      end
    end
  end
end
