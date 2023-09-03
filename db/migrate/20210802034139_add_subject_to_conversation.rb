class AddSubjectToConversation < ActiveRecord::Migration[6.1]
  def change
    add_column :conversations, :subject, :string
  end
end
