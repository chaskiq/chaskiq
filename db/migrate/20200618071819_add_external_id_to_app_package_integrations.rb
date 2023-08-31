class AddExternalIdToAppPackageIntegrations < ActiveRecord::Migration[6.0]
  def change
    add_column :app_package_integrations, :external_id, :string
    add_index :app_package_integrations, :external_id
  end
end
