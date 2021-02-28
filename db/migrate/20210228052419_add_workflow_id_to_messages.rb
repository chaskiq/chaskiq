class AddWorkflowIdToMessages < ActiveRecord::Migration[6.1]
  def change
    add_reference :campaigns, :workflow, null: true, foreign_key: true
  end
end
