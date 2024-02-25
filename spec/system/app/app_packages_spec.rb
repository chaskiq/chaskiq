require "rails_helper"

RSpec.describe "AppPackages", type: :system do
  let!(:app) do
    require "app_packages_catalog"
    AppPackagesCatalog.update_all

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled")
  end

  let!(:agent_role) do
    app.add_admin({
                    email: "miguelmichelson@gmail.com",
                    name: "test agent",
                    role: "admin",
                    password: 123_456,
                    password_confirmation: 123_456
                  })
  end

  before :each do
    # Replace with the Ruby equivalent of the setup code
    # Example: Plugin.restore_plugins_from_fs
    Plugin.restore_plugins_from_fs
  end

  context "when managing AppPackages" do
    before do
      # Login and other setup before each test

      # Replace with Ruby equivalent of cy.appEval
      # Example: Update roles for an Agent
    end

    it "denies access for non-admin roles" do
      app.roles.map { |o| o.update(role: "agent") }
      app.key

      login

      # visit '/apps'
      find("a", text: "my app").click
      # sleep(2) # Replace with Capybara wait mechanisms if possible
      find("a[aria-label='Settings']").click
      expect(page).to have_content("Access denied")
    end

    it "allows access and displays settings for admin roles" do
      # Additional setup for admin role if needed

      app.roles.map { |o| o.update(role: "admin_only") }
      login
      # visit '/apps'
      find("a", text: "my app").click

      find("a[aria-label='Settings']").click
      expect(page).to have_content("App Settings")
      expect(page).to have_content("Team")
      expect(page).to have_content("Integrations")

      click_on("Integrations")
      expect(page).to have_content("Third party integrations")
    end
  end

  context "when adding AppPackages" do
    before do
      App.last.update(owner_id: agent_role.agent.id)
    end

    it "adds AppPackages" do
      login

      find("a", text: "my app").click

      find("a[aria-label='Settings']").click
      expect(page).to have_content("Integrations")

      click_on("Integrations")
      click_on("Available API's")
      find("[data-cy=services-reveniu-add]").click

      click_on("Save")
      expect(page).to have_content("Updated successfully")
    end

    it "manages home apps app packages" do
      app.roles.map { |o| o.update(role: "admin_only") }

      login

      # visit '/apps'
      find("a", text: "my app").click
      # sleep(0.5) # Consider replacing with Capybara's wait mechanisms

      find("a[aria-label='Settings']").click
      sleep(0.5) # Consider replacing with Capybara's wait mechanisms

      click_on("Messenger Settings")
      sleep(0.5) # Consider replacing with Capybara's wait mechanisms

      click_on("Apps")
      expect(page).to have_content("Add apps to your Messenger")
      find("a", text: "Add app").click

      expect(page).to have_content("Send App Package")

      find('button[data-cy="add-package-ContentShowcase"]').click

      # Find and click on the ContentShowcase element's corresponding button
      # within(find(".content-showcase-selector")) do
      #  find("button").click
      # end

      expect(page).to have_content("Pick a template")

      find('div[data-cy="action-announcement"]').click

      # click_on("Announcement")

      click_on("Customize")

      fill_in "heading", with: "Hello, World"
      fill_in "page_url", with: "https://github.com/rails/rails"
      click_on("autofill inputs with page details")

      # Wait for the fields to be auto-filled
      expect(page).to have_field("title", with: "GitHub - rails/rails: Ruby on Rails")
      expect(find('input[name="cover_image"]').value).to be_present

      click_on("Add to messenger home")
      # Further actions or assertions as needed
    end
  end
end
