require "rails_helper"

RSpec.describe "Task Bot Spec", type: :system, js: true do
  let!(:app) do
    Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  let!(:agent_role) do
    app.add_admin({ email: "miguel.michelson@cience.com", name: "test agent", role: "admin" })
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Additional setup, including Redis and AppPackagesCatalog updates
    # ...
  end

  before :each do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    Redis.current.del("app_user:1:trigger_locked")

    require "app_packages_catalog"
    AppPackagesCatalog.update_all
  end

  it "sessionless bot task wait for reply" do
    app.update({ inline_new_conversations: false })
    bot_task_command({
                       app_key: app.key
                     })

    open_new_messenger({ disable_open: true, params: { lang: "en", old_embed: nil } }, sessionless: true) do |page|
      expect(page).to have_content("one")
      expect(page).to have_content("two")
      expect(page).to have_content("tree")
      #  # Typing into textarea and checking response

      page.find("textarea").set("oeoe").native.send_keys(:return)

      expect(page).to have_content("oeoe")

      expect(page).to have_content("four")
    end
  end

  it "sessionless never ask email'" do
    app_bot_settings({ email_requirement: "never" })

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      click_link "Start a conversation"
      #  .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]').click()
      # Typing into textarea and checking response
      page.find("textarea").set("oeoe").native.send_keys(:return)
      expect(page).to have_content("will reply as soon as they can.")
    end
  end

  it "sessionless 2 always ask email , email validation" do
    app_bot_settings({ email_requirement: "Always" })

    add_app_package("Qualifier")

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      click_link "Start a conversation"
      #  .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]').click()
      # Typing into textarea and checking response
      page.find("textarea").set("oeoe").native.send_keys(:return)
      expect(page).to have_content("will reply as soon as they can.")

      expect(page).to have_content("Are you an existing")
      expect(page).to have_content("Yes, I'm a customer")
      click_button("Yes, I'm a customer")
      # click_button("Are you an existing")
      expect(page).to have_content("by email")
    end
  end

  it "sessionless always ask email, email validation" do
    # Setup app with email requirement always
    app_bot_settings({ email_requirement: "Always" })

    # Add the 'Qualifier' package or similar setup
    add_app_package("Qualifier")

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("Start a conversation")
      click_link "Start a conversation"

      textarea = find("textarea")
      textarea.set("oeoe").native.send_keys(:return)

      expect(page).to have_content("will reply as soon as they can.")
      expect(page).to have_content("Are you an existing")

      page.find("Yes, I'm a customer").click # Update this selector based on actual content
      expect(page).to have_content("by email")

      input_field = page.find(:xpath, "/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/input")
      input_field.set("John")
      page.find(:xpath, "/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/div/button").click

      expect(page).to have_content("is invalid")

      input_field.set("John@apple.test")
      page.find(:xpath, "/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/div/button").click

      expect(page).to have_content("Thank you")
    end
  end

  it "sessionless never asks for email" do
    # Setup app with email requirement set to 'never'
    app_bot_settings({ email_requirement: "never" })

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("Start a conversation")
      click_link("Start a conversation")

      textarea = page.find("textarea")
      expect(textarea).to be_visible
      textarea.set("oeoe").native.send_keys(:return)
      sleep(2) # Wait for response

      expect(page).to have_content("will reply as soon as they can.")
      expect(page).to have_content("oeoe")
      expect(page).to have_content("Are you an existing")
      expect(page).to have_content("I'm a customer") # Update the text based on actual content
      # Additional assertions or interactions if needed
      page.click_button("I'm a customer")
      expect(page).to have_content("reply button: Yes, I'm a customer")
      expect(page).to have_content("you will get a reply from one of our agents")
    end
  end

  describe "Start Conversation Welcome Bot", type: :system, js: true do
    it "start_conversation" do
      new_conversation_bot_task_command({
                                          app_key: app.key
                                        })

      open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
        expect(page).to have_content("Start a conversation")
        page.find("see more?").click
        expect(page).to have_content("see more?")
        page.find("see more?").click
        sleep(2)
        expect(page).to have_content("sauper!")

        page.find("textarea").set("oeoe").native.send_keys(:return)
        expect(page).to have_content("oeoe")
        page.find("go to!").click
        expect(page).to have_content("ah ah !")
      end
    end
  end
end
