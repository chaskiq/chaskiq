class CreateAppMetrics < ActiveRecord::Migration[6.1]
  def change
    create_table :app_metrics, id: false do |t|
      t.string :kind
      t.references :app, null: false, foreign_key: true
      t.float :value
      t.timestamps
    end

    execute <<~SQL
      select create_hypertable('app_metrics', 'created_at');

      select add_retention_policy('app_metrics', interval '1 week');
    SQL
  end
end
