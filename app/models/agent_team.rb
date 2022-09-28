class AgentTeam < ApplicationRecord
  belongs_to :team
  belongs_to :role

  validates :role_id, uniqueness: { scope: :team_id }
end
