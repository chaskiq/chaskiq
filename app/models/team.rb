class Team < ApplicationRecord
  belongs_to :app
  has_many :agent_teams, dependent: :destroy_async
  has_many :roles, through: :agent_teams # , source: :role
  has_many :agents, through: :roles # , source: :agent, class_name: "Agent"
  validates :name, presence: true
end
