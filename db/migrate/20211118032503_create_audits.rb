class CreateAudits < ActiveRecord::Migration[6.1]
  def change
    create_table :audits do |t|
      t.string :action
      t.references :agent, index: true, null: false, foreign_key: true
      t.references :auditable, polymorphic: true, null: false
      t.jsonb :data
      t.string :ip

      t.timestamps
    end
  end
end
