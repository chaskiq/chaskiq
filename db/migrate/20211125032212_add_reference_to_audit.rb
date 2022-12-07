class AddReferenceToAudit < ActiveRecord::Migration[6.1]
  def change
    add_reference :audits, :app, null: true, foreign_key: true
  end
end
