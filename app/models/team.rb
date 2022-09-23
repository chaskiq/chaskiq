class Team < ApplicationRecord
  belongs_to :app
  has_many :agent_teams
  has_many :agents, through: :agent_teams
end
