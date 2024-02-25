require "rails_helper"

RSpec.describe "Settings Spec", type: :system do
  let!(:app) do
    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled")
  end

  let!(:agent_role) do
    app.add_admin({
                    email: "miguelmichelson@gmail.com",
                    name: "test agent",
                    role: "admin", password: 123_456, password_confirmation: 123_456
                  })
  end

  it "Team view + invite view" do
    login
    # visit '/apps'
    find("a", text: "my app").click

    find("a[aria-label='Settings']").click(force: true)
    expect(page).to have_content("App Settings")
    expect(page).to have_content("Messenger Settings")
    expect(page).to have_content("Integrations")
    expect(page).to have_content("Webhooks")
    expect(page).to have_content("API Access")

    click_on("Team")

    expect(page).to have_content("EMAIL")
    # expect(page).to have_content('Owner')

    expect(page).to have_content("ACCESS LIST")
    expect(page).to have_content("ACTIONS")

    expect(page).to have_selector("div", text: "chaskiq bot")

    expect(page).to have_selector("a", text: "edit link")
    expect(page).to have_selector("button", text: "remove")

    expect(page).to have_selector("div", text: "miguelmichelson@gmail.com")
    expect(page).to have_selector("div", text: "miguel")

    click_on("Invitations")

    expect(page).to have_content("EMAIL")
    expect(page).to have_content("ACTIONS")
    expect(page).to have_content("Add Team Member")
  end
end
