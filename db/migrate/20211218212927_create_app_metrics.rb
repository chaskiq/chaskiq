class CreateAppMetrics < ActiveRecord::Migration[6.1]
  def change
    create_table :app_metrics, id: false do |t|
      t.string :kind
      t.references :app, null: false, foreign_key: true

      t.timestamps
    end

    execute "SELECT create_hypertable('app_metrics', 'created_at');"
  end
end
