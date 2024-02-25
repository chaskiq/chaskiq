require "rails_helper"

RSpec.describe "Conversation Spec", type: :system, js: true do
  let!(:app) do
    # Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  let!(:agent) do
    agent = app.add_agent({
                            email: "test@test.cl",
                            name: "sharleena",
                            password: "123456",
                            password_confirmation: "123456"
                          },
                          role_attrs: {
                            role: "admin"
                          })
    agent.agent
  end

  let!(:app_user) do
    app.add_user(email: "test@test.cl")
  end

  before do
    # Setup basic app scenario
    # ...
  end

  describe "run previous" do
    it "run previous conversations" do
      start_conversation_from_agent

      open_new_messenger({ params: { lang: "en" } }) do |page|
        expect(page).to have_content("Start a conversation")
        expect(App.last.app_users.size).to eq(1)
        expect(page).to have_content("a few seconds ago")

        find("#conversations-list a").click
        expect(page).to have_content("foobar")

        find("textarea").set("oeoe").native.send_keys(:return)
        expect(page).to have_content("oeoe")
      end
    end
  end

  describe "open conversation blocked replies" do
    it "will show cta for new conversation, replies blocked" do
      start_conversation_from_agent

      Conversation.last.close!

      app.update(inbound_settings: {
                   "enabled" => true,
                   "users" => {
                     "enabled" => true,
                     "enabled_inbound" => true,
                     "segment" => "some",
                     "close_conversations_enabled" => true,
                     "close_conversations_after" => 0
                   },
                   "visitors" => {
                     "visitors_enable_inbound" => true,
                     "enabled" => true,
                     "enabled_inbound" => true,
                     "segment" => "all",
                     "close_conversations_after" => -1
                   }
                 })

      open_new_messenger({ params: { lang: "en" } }) do |page|
        # expect(page).to have_content('a few seconds ago')
        page.find("#conversations-list a").click
        expect(page).to have_content("foobar")
        expect(page).to have_content("This conversation has ended")

        page.click_link("Start a conversation")
      end
    end

    it "will show cta for conversation closed, replies blocked" do
      start_conversation_from_agent

      app.update(inbound_settings: {
                   "enabled" => true,
                   "users" => {
                     "enabled" => true,
                     "enabled_inbound" => true,
                     "segment" => "some",
                     "close_conversations_enabled" => true,
                     "close_conversations_after" => 0
                   },
                   "visitors" => {
                     "enabled_inbound" => true,
                     "enabled" => true,
                     "segment" => "all",
                     "close_conversations_after" => -1
                   }
                 })

      visit "/tester/#{App.last.key}"

      open_new_messenger({ params: { lang: "en" } }) do |page|
        expect(page).to have_content("a few seconds ago")

        page.find("#conversations-list a").click
        expect(page).to have_content("foobar")

        # Simulate closing the conversation from the backend
        Conversation.last.close!

        expect(page).to have_content("This conversation has ended")
        expect(page).to have_content("Start a conversation")
      end
    end

    it "will show textarea" do
      start_conversation_from_agent

      app.update(inbound_settings: {
                   "enabled" => true,
                   "users" => {
                     "enabled" => true,
                     "enabled_inbound" => true,
                     "segment" => "some",
                     "close_conversations_enabled" => false,
                     "close_conversations_after" => 0
                   },
                   "visitors" => {
                     "enabled_inbound" => true,
                     "visitors_enable_inbound" => true,
                     "enabled" => true,
                     "segment" => "all",
                     "close_conversations_after" => -1
                   }
                 })

      open_new_messenger({ params: { lang: "en" } }) do |page|
        expect(page).to have_content("a few seconds ago")
        page.find("#conversations-list a").click
        page.find("textarea").set("1234").send_keys(:return)
        expect(page).to have_content("1234")
      end
    end
  end

  describe "basic" do
    it "start_conversation" do
      open_new_messenger({ params: { lang: "en" } }) do |page|
        expect(page).to have_content("Start a conversation")

        page.find(:xpath, "/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]").click
        textarea = page.find("textarea")
        expect(textarea).to be_visible

        textarea.set("oeoe")
        # expect(page).to have_content('oeoe')

        # start_conversation_command({
        #  text: '11111',
        #  app_key: app.key,
        #  rules: [],
        # })

        textarea.set("oeoe").native.send_keys :return
      end
    end
  end
end
