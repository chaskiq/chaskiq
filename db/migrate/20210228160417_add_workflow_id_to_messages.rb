class AddWorkflowIdToMessages < ActiveRecord::Migration[6.1]
  def change
    return if ActiveRecord::Base.connection.column_exists?('campaigns', 'workflow_id')
    add_reference :campaigns, :workflow, null: true, foreign_key: true
  end
end
