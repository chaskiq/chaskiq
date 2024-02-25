require "rails_helper"

RSpec.describe "Agent Invitation", type: :system do
  let(:agent) { Agent.last }

  let!(:app) do
    require "app_packages_catalog"
    AppPackagesCatalog.update_all

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled")
  end

  before :each do
    app = App.last
    invited_agent = Agent.invite!(email: "foo@bar.com") # , name: 'John Doe')
    role = app.roles.find_or_initialize_by(agent_id: invited_agent.id)
    role.save
  end

  it "Sign in view" do
    # Generate the invitation token
    agent.send :generate_invitation_token!
    token = agent.raw_invitation_token

    visit "/agents/invitation/accept?invitation_token=#{token}"
    expect(page).to have_selector('input[placeholder="Type your password"]')

    fill_in "agent_password", with: "123456"
    fill_in "agent_password_confirmation", with: "123456"
    click_on "Set my password"
    expect(page).to have_content("my app")
  end

  it "validates password match" do
    # Generate the invitation token
    agent.send :generate_invitation_token!
    token = agent.raw_invitation_token

    visit "/agents/invitation/accept?invitation_token=#{token}"
    expect(page).to have_selector('input[placeholder="Type your password"]')

    fill_in "agent_password", with: "123456"
    fill_in "agent_password_confirmation", with: "1234567"
    click_on "Set my password"
    expect(page).to have_content("Password confirmation doesn't match Password")
  end
end
