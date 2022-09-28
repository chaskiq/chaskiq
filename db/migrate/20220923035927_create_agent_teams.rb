class CreateAgentTeams < ActiveRecord::Migration[7.0]
  def change
    create_table :agent_teams do |t|
      t.references :team, null: false, foreign_key: true
      t.references :role, null: false, foreign_key: true

      t.timestamps

      t.index [:team_id, :role_id], unique: true
    end
  end
end
