class AddAppToVisits < ActiveRecord::Migration[6.0]
  def change
    add_reference :visits, :app, null: false, foreign_key: true
  end
end
