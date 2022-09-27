require "rails_helper"

RSpec.describe Team, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  let!(:role) do
    app.add_agent({ email: "test@test.cl", first_name: "dsdsa" })
  end

  let!(:team) do
    app.teams.create(name: "team1")
  end

  it "create team" do
    team.agent_teams.create(role_id: role.id)
    expect(team.agents.size).to be == 1
  end

  it "remove agent team" do
    team.agent_teams.create(role_id: role.id)
    expect(team.agents.size).to be == 1
    team.agent_teams.first.destroy
    expect(team.agents.size).to be == 0
  end
end
