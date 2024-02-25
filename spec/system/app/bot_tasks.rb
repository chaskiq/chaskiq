require "rails_helper"

RSpec.describe "Bot Tasks", type: :system do
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
    App.last.start_conversation(
      message: {
        text_content: "hi from test backend",
        serialized_content: MessageApis::BlockManager.serialized_text("some text from backend")
      },
      from: app_user
    )
  end

  it "Insert AppPackages" do
    login
    # visit '/apps'
    find("a", text: "my app").click
    find("a[aria-label='Routing Bots']", visible: false).click(force: true)

    expect(page).to have_content("Outbound")
    expect(page).to have_content("New Conversations")
    expect(page).to have_content("Bot Tasks")

    click_on("Outbound")
    click_on("Create New Task")

    fill_in "bot_task_title", with: "my super task"
    find('[data-cy="bot-task-create"]').click

    click_on("Editor")

    click_on("Add New")
    find('input[placeholder="write path title"]').set("foo")
    find('[data-cy="bot-task-create-path"]').click

    click_on("foo")

    click_on("Add App")
    find("[data-cy=add-package-ContentShowcase]").click

    expect(page).to have_content("Pick a template")
    # click_on('Announcement')
    all(".list-item").first.click

    click_on("Customize")

    fill_in "heading", with: "Hello, World"
    fill_in "page_url", with: "https://github.com/rails/rails"
    click_on("autofill inputs with page details")

    expect(page).to have_field("title", with: "GitHub - rails/rails: Ruby on Rails")
    expect(find('input[name="cover_image"]').value).to be_present

    click_on("Add to messenger home")

    click_on("Send App")

    # Using a custom wait logic to ensure the 'Send App' button is not disabled
    expect(page).to have_no_content("Send App")

    # find('[data-cy=send-app-ContentShowcase]').click
    expect(page).to have_content("Hello, World")
  end
end
