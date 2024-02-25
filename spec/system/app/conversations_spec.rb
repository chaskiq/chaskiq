require "rails_helper"

RSpec.describe "Conversations Spec", type: :system do
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
                    role: "admin", password: 123_456, password_confirmation: 123_456
                  })
  end

  let!(:app_user) do
    # Additional setup to mimic cy.appEval for conversation creation
    App.last.add_user(
      email: "test@test2.cl",
      name: "ebola boli",
      first_name: "some user"
    )
  end

  before :each do
    # Mimic the appEval setup from Cypress
    App.last.start_conversation(
      message: {
        text_content: "hi from test backend",
        serialized_content: MessageApis::BlockManager.serialized_text("some text from backend")
      },
      from: app_user
    )
  end

  it "Send app package on conversation" do
    login
    find("a", text: "my app").click

    find("a[aria-label='Conversations']").click(force: true)

    first("[data-cy=conversation-item]").click(force: true)
    expect(page).to have_content("some text from backend")

    find("[contenteditable]").click
    find("[contenteditable]").set('foo \r\n')

    find("[data-cy=inline-tooltip-button-AppPackage]").click
    find("[data-cy=add-package-ContentShowcase]").click

    expect(page).to have_content("Pick a template")

    all(".list-item").first.click
    click_on("Customize")

    fill_in "heading", with: "Hello, World"
    fill_in "page_url", with: "https://github.com/rails/rails"
    click_on("autofill inputs with page details")

    # Use Capybara's wait mechanism instead of sleep
    expect(page).to have_field("title", with: "GitHub - rails/rails: Ruby on Rails")

    # Use matcher to check if input value is present
    expect(find("input[name=cover_image]").value).to be_present

    click_on("Add to messenger home")

    # Use Capybara's wait mechanism to check for absence of content
    expect(page).to have_no_content("Send App")

    find("[data-cy=send-app-ContentShowcase]").click

    # Expectations after clicking 'Send App'
    expect(page).to have_content("HELLO, WORLD")
    expect(page).to have_content("CONTENTSHOWCASE")
  end
end
